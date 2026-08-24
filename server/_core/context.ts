import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import type { User } from "../../drizzle/schema";
import { getUserByEmail, upsertUser } from "../db";
import { ENV } from "./env";

// Client Supabase côté serveur, utilisé uniquement pour VÉRIFIER les jetons
// de session envoyés par le navigateur (pas pour se connecter lui-même).
let supabaseAuthClient: ReturnType<typeof createClient> | null = null;
function getSupabaseAuthClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) return null;
  if (!supabaseAuthClient) {
    supabaseAuthClient = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseAuthClient;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
      const supabase = getSupabaseAuthClient();
      if (supabase) {
        const { data, error } = await supabase.auth.getUser(token);
        // Le jeton doit être valide ET correspondre à un compte déjà connu
        // de notre propre table "users" (créé via le tableau de bord Supabase
        // puis synchronisé, ou via nos scripts). Une simple inscription
        // Supabase ne suffit donc pas à obtenir un accès admin.
        if (!error && data.user?.email) {
          const email = data.user.email;
          user = (await getUserByEmail(email)) ?? null;

          // Première connexion réussie avec ce compte Supabase : on crée
          // automatiquement son profil "propriétaire" dans notre base —
          // aucun script à lancer. ⚠️ Ceci suppose que les inscriptions
          // publiques sont désactivées dans Supabase Auth (Authentication >
          // Settings > "Allow new users to sign up" = désactivé), sinon
          // n'importe qui pourrait créer un compte Supabase et obtenir un
          // accès admin de cette façon.
          if (!user) {
            await upsertUser({
              openId: `supabase:${data.user.id}`,
              email,
              name: (data.user.user_metadata?.name as string | undefined) ?? null,
              loginMethod: "supabase",
              role: "owner",
              lastSignedIn: new Date(),
            });
            user = (await getUserByEmail(email)) ?? null;
          }
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
