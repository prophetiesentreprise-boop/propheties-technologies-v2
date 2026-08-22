import { COOKIE_NAME } from "@shared/const";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import {
  createLocalAdminAccount,
  createOrRenewAdminInvitation,
  createContactInquiry,
  createTutorial,
  deleteTutorial,
  getAdminUsers,
  getAdminInvitations,
  getAllTutorials,
  getContactInquiries,
  getDashboardOverview,
  getPublishedTutorials,
  getSiteContentEntries,
  getSiteVisuals,
  getPendingAdminInvitationByTokenHash,
  getAcceptedAdminInvitationByTokenHash,
  getUserByEmail,
  markAdminInvitationAccepted,
  recordSiteVisit,
  touchUserLastSignedIn,
  upsertSiteContentEntry,
  upsertSiteVisual,
  updateContactInquiry,
  updateTutorial,
  updateUserRole,
} from "./db";
import { createInvitationToken, hashAdminPassword, hashInvitationToken, normalizeAdminEmail, verifyAdminPassword } from "./adminCredentials";
import { isAdminInvitationEmailConfigured, sendAdminInvitationEmail } from "./adminEmail";
import { invokeLLM } from "./_core/llm";
import { adminProcedure, ownerProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const tutorialInput = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10).max(2000),
  videoUrl: z.url().max(1024),
  isPublished: z.boolean().default(true),
});

const chatbotMessageInput = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1500),
});

const visualSlotSchema = z.enum([
  "homeHero",
  "servicesHero",
  "tutorialsHero",
  "aboutHero",
  "contactHero",
  "networkService",
  "cyberService",
  "supportService",
  "aiService",
  "trainingService",
  "consultingService",
  "homeDarkCta",
  "servicesDarkCta",
  "aboutDarkCta",
  "aboutQrCode",
  "serviceDetailDarkCta",
  "footerBackground",
  "valueReliability",
  "valueConfidentiality",
  "valueRigor",
  "valueResponsiveness",
  "methodNetwork",
  "methodCyber",
  "methodSupport",
  "methodAi",
  "methodTraining",
  "methodConsulting",
]);

const visualUploadInput = z.object({
  slot: visualSlotSchema,
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z.string().min(32).max(7_000_000),
});

const siteContentInput = z.object({
  key: z.string().trim().min(3).max(120).regex(/^[a-z0-9.]+$/, "Invalid content key"),
  value: z.string().trim().min(1).max(5000),
});

const inquiryStatusSchema = z.enum(["new", "in_progress", "responded", "closed"]);

const inquiryUpdateInput = z.object({
  id: z.number().int().positive(),
  status: inquiryStatusSchema,
  adminNote: z.string().trim().max(4000).nullable().optional(),
  replyDraft: z.string().trim().max(5000).nullable().optional(),
});

const adminPasswordSchema = z.string().min(12, "Le mot de passe doit comporter au moins 12 caractères.").max(200);
const localAdminLoginInput = z.object({
  email: z.email(),
  password: adminPasswordSchema,
  entry: z.string().regex(/^[a-f0-9]{64}$/),
});
const inviteAdminInput = z.object({
  name: z.string().trim().min(2).max(160).nullable().optional(),
  email: z.email(),
  origin: z.string().url().max(500),
});

function getSafeAppOrigin(origin: string) {
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Adresse d’activation invalide.");
  }
  return parsed.origin;
}

async function establishLocalAdminSession(ctx: { req: Request; res: Response }, user: { openId: string; name: string | null }) {
  const sessionToken = await sdk.createSessionToken(user.openId, {
    name: user.name || "Administrateur Propheties Technologies",
    expiresInMs: 30 * 24 * 60 * 60 * 1000,
  });
  ctx.res.cookie(COOKIE_NAME, sessionToken, {
    ...getSessionCookieOptions(ctx.req),
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function toClientUser(user: NonNullable<Awaited<ReturnType<typeof getUserByEmail>>>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

const chatbotSystemPrompt = `Tu es l’assistant de Propheties Technologies, entreprise de services IT basée à Abidjan, Côte d’Ivoire. Réponds exclusivement en français avec un ton professionnel, chaleureux et concis. Tu aides les visiteurs à comprendre les offres suivantes : réseaux et installations, cybersécurité, maintenance et support, technologie et IA, formation IT, audit et solutions sur-mesure. Ne fabrique jamais de prix, délais, certifications, partenaires, témoignages, résultats chiffrés ou disponibilités. Pour un besoin précis, une demande de prix, un devis ou une urgence, invite poliment à utiliser le formulaire « Demander un devis » ou à contacter infos@prophetiestechnologies.com. Ne donne pas de conseils dangereux ni d’instructions offensives en cybersécurité. Si la question ne concerne pas les services de l’entreprise, ramène aimablement la conversation vers la façon dont Propheties Technologies peut aider.`;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ? toClientUser(opts.ctx.user) : null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    canAccessAdminLogin: publicProcedure.input(z.object({ entry: z.string().regex(/^[a-f0-9]{64}$/) })).query(async ({ input }) => {
      const invitation = await getAcceptedAdminInvitationByTokenHash(hashInvitationToken(input.entry));
      return { allowed: Boolean(invitation) };
    }),
    localLogin: publicProcedure.input(localAdminLoginInput).mutation(async ({ input, ctx }) => {
      const invitation = await getAcceptedAdminInvitationByTokenHash(hashInvitationToken(input.entry));
      if (!invitation) throw new Error("Identifiants incorrects.");
      const email = normalizeAdminEmail(input.email);
      if (email !== invitation.email) throw new Error("Identifiants incorrects.");
      const user = await getUserByEmail(email);
      if (!user || !user.passwordHash || user.loginMethod !== "local" || (user.role !== "admin" && user.role !== "owner")) {
        throw new Error("Identifiants incorrects.");
      }
      const passwordValid = await verifyAdminPassword(input.password, user.passwordHash);
      if (!passwordValid) throw new Error("Identifiants incorrects.");

      await touchUserLastSignedIn(user.id);
      await establishLocalAdminSession(ctx, user);
      return { success: true } as const;
    }),
    activateAdminInvitation: publicProcedure.input(z.object({
      token: z.string().regex(/^[a-f0-9]{64}$/),
      password: adminPasswordSchema,
    })).mutation(async ({ input, ctx }) => {
      const invitation = await getPendingAdminInvitationByTokenHash(hashInvitationToken(input.token));
      if (!invitation) throw new Error("Ce lien d’activation est invalide, expiré ou a déjà été utilisé.");

      const existingUser = await getUserByEmail(invitation.email);
      if (existingUser) {
        throw new Error("Un compte utilise déjà cette adresse e-mail. Demandez au propriétaire de vérifier l’invitation.");
      }

      const user = {
        openId: `local_admin_${randomUUID()}`,
        name: invitation.name,
        email: invitation.email,
        passwordHash: await hashAdminPassword(input.password),
      };
      await createLocalAdminAccount(user);
      await markAdminInvitationAccepted(invitation.id);
      await establishLocalAdminSession(ctx, user);
      return { success: true } as const;
    }),
  }),
  tutorials: router({
    listPublic: publicProcedure.query(() => getPublishedTutorials()),
    listAdmin: adminProcedure.query(() => getAllTutorials()),
    create: adminProcedure.input(tutorialInput).mutation(async ({ input }) => {
      await createTutorial(input);
      return { success: true } as const;
    }),
    update: adminProcedure
      .input(tutorialInput.extend({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const { id, ...values } = input;
        await updateTutorial(id, values);
        return { success: true } as const;
      }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await deleteTutorial(input.id);
      return { success: true } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2).max(160),
          email: z.email(),
          service: z.string().trim().min(2).max(160),
          message: z.string().trim().min(10).max(3000),
        }),
      )
      .mutation(async ({ input }) => {
        await createContactInquiry(input);
        return { success: true } as const;
      }),
    listAdmin: adminProcedure.query(() => getContactInquiries()),
    updateAdmin: adminProcedure.input(inquiryUpdateInput).mutation(async ({ input }) => {
      const { id, ...values } = input;
      await updateContactInquiry(id, values);
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    overview: adminProcedure.query(() => getDashboardOverview()),
  }),
  analytics: router({
    recordVisit: publicProcedure
      .input(z.object({ visitorId: z.string().uuid(), path: z.string().startsWith("/").max(200) }))
      .mutation(async ({ input }) => {
        if (!input.path.startsWith("/admin")) {
          await recordSiteVisit(input.visitorId, input.path);
        }
        return { success: true } as const;
      }),
  }),
  admins: router({
    list: ownerProcedure.query(() => getAdminUsers()),
    listInvitations: ownerProcedure.query(() => getAdminInvitations()),
    invitationConfig: ownerProcedure.query(() => ({ configured: isAdminInvitationEmailConfigured() })),
    invite: ownerProcedure.input(inviteAdminInput).mutation(async ({ input, ctx }) => {
      if (!isAdminInvitationEmailConfigured()) {
        throw new Error("L’envoi d’e-mails n’est pas encore configuré. Vous pourrez l’activer plus tard dans les paramètres sécurisés.");
      }

      const email = normalizeAdminEmail(input.email);
      const existingUser = await getUserByEmail(email);
      if (existingUser) throw new Error("Cette adresse e-mail possède déjà un compte. Gérez son rôle dans la liste ci-dessous.");

      const token = createInvitationToken();
      const tokenHash = hashInvitationToken(token);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const invitation = await createOrRenewAdminInvitation({
        email,
        name: input.name?.trim() || null,
        tokenHash,
        invitedBy: ctx.user.id,
        expiresAt,
      });
      const activationUrl = `${getSafeAppOrigin(input.origin)}/admin/activation?token=${token}`;
      await sendAdminInvitationEmail({
        recipientEmail: email,
        recipientName: invitation.name,
        activationUrl,
        idempotencyKey: `admin-invite-${invitation.id}-${tokenHash.slice(0, 16)}`,
      });
      return { success: true, expiresAt } as const;
    }),
    updateRole: ownerProcedure
      .input(z.object({ id: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        if (input.id === ctx.user.id && input.role !== "admin") {
          throw new Error("Le propriétaire ne peut pas retirer son propre accès administrateur.");
        }
        await updateUserRole(input.id, input.role);
        return { success: true } as const;
      }),
  }),
  visuals: router({
    list: publicProcedure.query(() => getSiteVisuals()),
    upload: adminProcedure.input(visualUploadInput).mutation(async ({ input }) => {
      const bytes = Buffer.from(input.dataBase64, "base64");
      if (bytes.byteLength > 5 * 1024 * 1024) {
        throw new Error("Image too large");
      }

      const extension = input.contentType === "image/jpeg" ? "jpg" : input.contentType.split("/")[1];
      const { url } = await storagePut(`site-visuals/${input.slot}.${extension}`, bytes, input.contentType);
      await upsertSiteVisual(input.slot, url);
      return { url };
    }),
  }),
  content: router({
    list: publicProcedure.query(() => getSiteContentEntries()),
    update: adminProcedure.input(siteContentInput).mutation(async ({ input }) => {
      await upsertSiteContentEntry(input.key, input.value);
      return { success: true } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(chatbotMessageInput).min(1).max(12) }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          maxTokens: 450,
          messages: [
            { role: "system", content: chatbotSystemPrompt },
            ...input.messages,
          ],
        });
        const content = result.choices[0]?.message.content;
        const answer = typeof content === "string"
          ? content
          : "Je n’ai pas pu préparer une réponse pour le moment. Vous pouvez nous écrire via le formulaire de contact.";

        return { content: answer };
      }),
  }),
});

export type AppRouter = typeof appRouter;
