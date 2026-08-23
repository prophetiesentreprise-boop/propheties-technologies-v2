// api-src/index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/routers.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { z as z2 } from "zod";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import { desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin", "owner"]);
var adminInvitationStatusEnum = pgEnum("admin_invitation_status", ["pending", "accepted", "revoked", "expired"]);
var contactInquiryStatusEnum = pgEnum("contact_inquiry_status", ["new", "in_progress", "responded", "closed"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Identifiant unique par utilisateur (anciennement l'openId Manus OAuth). Pour les comptes admin locaux : "local:" + email. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var adminInvitations = pgTable("adminInvitations", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  status: adminInvitationStatusEnum("status").default("pending").notNull(),
  invitedBy: integer("invitedBy"),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
}, (table) => [
  index("adminInvitations_status_idx").on(table.status),
  index("adminInvitations_expiresAt_idx").on(table.expiresAt)
]);
var tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  videoUrl: varchar("videoUrl", { length: 1024 }).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var contactInquiries = pgTable("contactInquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  service: varchar("service", { length: 160 }).notNull(),
  message: text("message").notNull(),
  status: contactInquiryStatusEnum("status").default("new").notNull(),
  adminNote: text("adminNote"),
  replyDraft: text("replyDraft"),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var siteVisits = pgTable("siteVisits", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (table) => [
  index("siteVisits_createdAt_idx").on(table.createdAt),
  index("siteVisits_visitorId_idx").on(table.visitorId)
]);
var siteVisuals = pgTable("siteVisuals", {
  id: serial("id").primaryKey(),
  slot: varchar("slot", { length: 80 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var siteContentEntries = pgTable("siteContentEntries", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Forge = suite de services propriétaires Manus (IA, transcription, cartes,
  // notifications...). Conservé pour ne pas casser ces fonctionnalités tant
  // qu'elles n'ont pas été explicitement remplacées une par une. Voir le
  // message de Claude pour le détail de ce que ça couvre.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
  // Supabase (nouveau, pour la base de données et le stockage)
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
};

// server/db.ts
var _db = null;
var _client = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "owner";
      updateSet.role = "owner";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    updateSet.updatedAt = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createLocalAdminAccount(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(users).values({
    ...input,
    loginMethod: "local",
    role: "admin",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
}
async function createOrRenewAdminInvitation(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(adminInvitations).values({
    ...input,
    status: "pending",
    acceptedAt: null
  }).onConflictDoUpdate({
    target: adminInvitations.email,
    set: {
      name: input.name,
      tokenHash: input.tokenHash,
      invitedBy: input.invitedBy,
      expiresAt: input.expiresAt,
      status: "pending",
      acceptedAt: null,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.email, input.email)).limit(1);
  if (!result[0]) throw new Error("Invitation introuvable apr\xE8s enregistrement");
  return result[0];
}
async function getPendingAdminInvitationByTokenHash(tokenHash) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.tokenHash, tokenHash)).limit(1);
  const invitation = result[0];
  if (!invitation || invitation.status !== "pending") return void 0;
  if (invitation.expiresAt.getTime() <= Date.now()) {
    await db.update(adminInvitations).set({ status: "expired", updatedAt: /* @__PURE__ */ new Date() }).where(eq(adminInvitations.id, invitation.id));
    return void 0;
  }
  return invitation;
}
async function getAcceptedAdminInvitationByTokenHash(tokenHash) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.tokenHash, tokenHash)).limit(1);
  const invitation = result[0];
  return invitation?.status === "accepted" ? invitation : void 0;
}
async function markAdminInvitationAccepted(id) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(adminInvitations).set({ status: "accepted", acceptedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(adminInvitations.id, id));
}
async function getAdminInvitations() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: adminInvitations.id,
    email: adminInvitations.email,
    name: adminInvitations.name,
    status: adminInvitations.status,
    expiresAt: adminInvitations.expiresAt,
    acceptedAt: adminInvitations.acceptedAt,
    createdAt: adminInvitations.createdAt,
    updatedAt: adminInvitations.updatedAt
  }).from(adminInvitations).orderBy(desc(adminInvitations.updatedAt));
}
async function getPublishedTutorials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorials).where(eq(tutorials.isPublished, true)).orderBy(desc(tutorials.createdAt));
}
async function getAllTutorials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tutorials).orderBy(desc(tutorials.createdAt));
}
async function createTutorial(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(tutorials).values(input);
}
async function updateTutorial(id, input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(tutorials).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tutorials.id, id));
}
async function deleteTutorial(id) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(tutorials).where(eq(tutorials.id, id));
}
async function createContactInquiry(input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(contactInquiries).values(input);
}
async function getContactInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
}
async function updateContactInquiry(id, input) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(contactInquiries).set({
    ...input,
    updatedAt: /* @__PURE__ */ new Date(),
    ...input.status === "responded" ? { respondedAt: /* @__PURE__ */ new Date() } : {}
  }).where(eq(contactInquiries.id, id));
}
async function getAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).orderBy(desc(users.lastSignedIn));
}
async function updateUserRole(id, role) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
}
async function touchUserLastSignedIn(id) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
}
async function recordSiteVisit(visitorId, path) {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteVisits).values({ visitorId, path });
}
async function getDashboardOverview() {
  const db = await getDb();
  if (!db) {
    return {
      totalInquiries: 0,
      pendingInquiries: 0,
      respondedInquiries: 0,
      totalTutorials: 0,
      totalAdmins: 0,
      visitorsToday: 0,
      pageViewsToday: 0,
      uniqueVisitorsLast30Days: 0,
      pageViewsLast30Days: 0,
      recentInquiries: []
    };
  }
  const now = /* @__PURE__ */ new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast30Days = new Date(now);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
  startOfLast30Days.setHours(0, 0, 0, 0);
  const [inquiries, tutorialRows, userRows, visitRows] = await Promise.all([
    db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt)),
    db.select().from(tutorials),
    db.select({ role: users.role }).from(users),
    db.select().from(siteVisits).where(gte(siteVisits.createdAt, startOfLast30Days))
  ]);
  const visitsToday = visitRows.filter((visit) => visit.createdAt >= startOfToday);
  return {
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter((inquiry) => inquiry.status === "new" || inquiry.status === "in_progress").length,
    respondedInquiries: inquiries.filter((inquiry) => inquiry.status === "responded").length,
    totalTutorials: tutorialRows.length,
    totalAdmins: userRows.filter((user) => user.role === "admin" || user.role === "owner").length,
    visitorsToday: new Set(visitsToday.map((visit) => visit.visitorId)).size,
    pageViewsToday: visitsToday.length,
    uniqueVisitorsLast30Days: new Set(visitRows.map((visit) => visit.visitorId)).size,
    pageViewsLast30Days: visitRows.length,
    recentInquiries: inquiries.slice(0, 6)
  };
}
async function getSiteVisuals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteVisuals);
}
async function upsertSiteVisual(slot, imageUrl) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(siteVisuals).values({ slot, imageUrl }).onConflictDoUpdate({
    target: siteVisuals.slot,
    set: { imageUrl, updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function getSiteContentEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteContentEntries);
}
async function upsertSiteContentEntry(key, value) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(siteContentEntries).values({ key, value }).onConflictDoUpdate({
    target: siteContentEntries.key,
    set: { value, updatedAt: /* @__PURE__ */ new Date() }
  });
}

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "owner") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);
var ownerProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "owner" && ctx.user.openId !== ENV.ownerOpenId) {
      throw new TRPCError2({ code: "FORBIDDEN", message: "Cette action est r\xE9serv\xE9e au propri\xE9taire du site." });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/adminCredentials.ts
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
var scrypt = promisify(scryptCallback);
var KEY_LENGTH = 64;
function normalizeAdminEmail(email) {
  return email.trim().toLowerCase();
}
function createInvitationToken() {
  return randomBytes(32).toString("hex");
}
function hashInvitationToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
async function hashAdminPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}
async function verifyAdminPassword(password, storedHash) {
  if (!storedHash) return false;
  const [algorithm, salt, expectedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;
  const expected = Buffer.from(expectedHash, "hex");
  if (expected.length !== KEY_LENGTH) return false;
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

// server/adminEmail.ts
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character] ?? character);
}
function isAdminInvitationEmailConfigured() {
  return Boolean(ENV.resendApiKey && ENV.resendFromEmail);
}
async function sendAdminInvitationEmail(input) {
  if (!isAdminInvitationEmailConfigured()) {
    throw new Error("L\u2019envoi automatique des invitations n\u2019est pas encore configur\xE9. Ajoutez les param\xE8tres RESEND_API_KEY et RESEND_FROM_EMAIL lorsque vous serez pr\xEAt.");
  }
  const recipient = input.recipientName ? `Bonjour ${escapeHtml(input.recipientName)},` : "Bonjour,";
  const safeUrl = escapeHtml(input.activationUrl);
  const loginUrl = input.activationUrl.replace(/\/admin\/activation\?token=([a-f0-9]{64})$/, "/admin/connexion?entry=$1");
  const safeLoginUrl = escapeHtml(loginUrl);
  const html = `<main style="font-family:Arial,sans-serif;color:#111B42;max-width:560px;margin:auto;padding:32px"><p>${recipient}</p><p>Vous avez \xE9t\xE9 invit\xE9(e) \xE0 acc\xE9der \xE0 l\u2019espace d\u2019administration de <strong>Propheties Technologies</strong>.</p><p><a href="${safeUrl}" style="display:inline-block;background:#18B7E8;color:#0B1233;padding:14px 20px;border-radius:999px;font-weight:700;text-decoration:none">Activer mes acc\xE8s</a></p><p>Ce lien est personnel et valable 72 heures. Apr\xE8s l\u2019activation, conservez cette adresse pour vous connecter : <a href="${safeLoginUrl}">${safeLoginUrl}</a>.</p><p>Si vous n\u2019attendiez pas cette invitation, vous pouvez ignorer cet e-mail.</p><p style="font-size:12px;color:#64748B">Propheties Technologies \xB7 Abidjan</p></main>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Propheties-Technologies-Admin-Invitations/1.0",
      "Idempotency-Key": input.idempotencyKey
    },
    body: JSON.stringify({
      from: ENV.resendFromEmail,
      to: [input.recipientEmail],
      subject: "Invitation \u2014 Administration Propheties Technologies",
      html,
      text: `${input.recipientName ? `Bonjour ${input.recipientName},

` : "Bonjour,\n\n"}Vous avez \xE9t\xE9 invit\xE9(e) \xE0 acc\xE9der \xE0 l\u2019administration de Propheties Technologies. Activez vos acc\xE8s dans les 72 heures : ${input.activationUrl}

Apr\xE8s activation, vous pourrez vous connecter ici : ${loginUrl}`
    })
  });
  if (!response.ok) {
    throw new Error("L\u2019e-mail d\u2019invitation n\u2019a pas pu \xEAtre envoy\xE9. V\xE9rifiez la cl\xE9 Resend et l\u2019adresse d\u2019exp\xE9dition v\xE9rifi\xE9e.");
  }
}

// server/_core/llm.ts
var ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
var DEFAULT_MODEL = "claude-sonnet-4-5";
async function invokeLLM(params) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  const systemMessages = params.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const conversationMessages = params.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }));
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: params.model || DEFAULT_MODEL,
      max_tokens: params.maxTokens || 450,
      system: systemMessages || void 0,
      messages: conversationMessages
    })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }
  const data = await response.json();
  const textBlock = data.content.find((block) => block.type === "text");
  return {
    id: data.id,
    created: Math.floor(Date.now() / 1e3),
    model: data.model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: textBlock?.text ?? "" },
        finish_reason: data.stop_reason
      }
    ]
  };
}

// server/storage.ts
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
var BUCKET = "site-images";
function getSupabaseAdminClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error(
      "Stockage non configur\xE9 : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."
    );
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const supabase = getSupabaseAdminClient();
  const key = appendHashSuffix(normalizeKey(relKey));
  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: true
  });
  if (error) {
    throw new Error(`\xC9chec de l'envoi vers Supabase Storage : ${error.message}`);
  }
  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: publicUrlData.publicUrl };
}

// server/routers.ts
var tutorialInput = z2.object({
  title: z2.string().trim().min(3).max(255),
  description: z2.string().trim().min(10).max(2e3),
  videoUrl: z2.url().max(1024),
  isPublished: z2.boolean().default(true)
});
var chatbotMessageInput = z2.object({
  role: z2.enum(["user", "assistant"]),
  content: z2.string().trim().min(1).max(1500)
});
var visualSlotSchema = z2.enum([
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
  "methodConsulting"
]);
var visualUploadInput = z2.object({
  slot: visualSlotSchema,
  contentType: z2.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z2.string().min(32).max(7e6)
});
var siteContentInput = z2.object({
  key: z2.string().trim().min(3).max(120).regex(/^[a-z0-9.]+$/, "Invalid content key"),
  value: z2.string().trim().min(1).max(5e3)
});
var inquiryStatusSchema = z2.enum(["new", "in_progress", "responded", "closed"]);
var inquiryUpdateInput = z2.object({
  id: z2.number().int().positive(),
  status: inquiryStatusSchema,
  adminNote: z2.string().trim().max(4e3).nullable().optional(),
  replyDraft: z2.string().trim().max(5e3).nullable().optional()
});
var adminPasswordSchema = z2.string().min(12, "Le mot de passe doit comporter au moins 12 caract\xE8res.").max(200);
var localAdminLoginInput = z2.object({
  email: z2.email(),
  password: adminPasswordSchema,
  entry: z2.string().regex(/^[a-f0-9]{64}$/)
});
var inviteAdminInput = z2.object({
  name: z2.string().trim().min(2).max(160).nullable().optional(),
  email: z2.email(),
  origin: z2.string().url().max(500)
});
function getSafeAppOrigin(origin) {
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Adresse d\u2019activation invalide.");
  }
  return parsed.origin;
}
async function establishLocalAdminSession(ctx, user) {
  const sessionToken = await sdk.createSessionToken(user.openId, {
    name: user.name || "Administrateur Propheties Technologies",
    expiresInMs: 30 * 24 * 60 * 60 * 1e3
  });
  ctx.res.cookie(COOKIE_NAME, sessionToken, {
    ...getSessionCookieOptions(ctx.req),
    maxAge: 30 * 24 * 60 * 60 * 1e3
  });
}
function toClientUser(user) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
var chatbotSystemPrompt = `Tu es l\u2019assistant de Propheties Technologies, entreprise de services IT bas\xE9e \xE0 Abidjan, C\xF4te d\u2019Ivoire. R\xE9ponds exclusivement en fran\xE7ais avec un ton professionnel, chaleureux et concis. Tu aides les visiteurs \xE0 comprendre les offres suivantes : r\xE9seaux et installations, cybers\xE9curit\xE9, maintenance et support, technologie et IA, formation IT, audit et solutions sur-mesure. Ne fabrique jamais de prix, d\xE9lais, certifications, partenaires, t\xE9moignages, r\xE9sultats chiffr\xE9s ou disponibilit\xE9s. Pour un besoin pr\xE9cis, une demande de prix, un devis ou une urgence, invite poliment \xE0 utiliser le formulaire \xAB Demander un devis \xBB ou \xE0 contacter infos@prophetiestechnologies.com. Ne donne pas de conseils dangereux ni d\u2019instructions offensives en cybers\xE9curit\xE9. Si la question ne concerne pas les services de l\u2019entreprise, ram\xE8ne aimablement la conversation vers la fa\xE7on dont Propheties Technologies peut aider.`;
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user ? toClientUser(opts.ctx.user) : null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    canAccessAdminLogin: publicProcedure.input(z2.object({ entry: z2.string().regex(/^[a-f0-9]{64}$/) })).query(async ({ input }) => {
      const invitation = await getAcceptedAdminInvitationByTokenHash(hashInvitationToken(input.entry));
      return { allowed: Boolean(invitation) };
    }),
    localLogin: publicProcedure.input(localAdminLoginInput).mutation(async ({ input, ctx }) => {
      const invitation = await getAcceptedAdminInvitationByTokenHash(hashInvitationToken(input.entry));
      if (!invitation) throw new Error("Identifiants incorrects.");
      const email = normalizeAdminEmail(input.email);
      if (email !== invitation.email) throw new Error("Identifiants incorrects.");
      const user = await getUserByEmail(email);
      if (!user || !user.passwordHash || user.loginMethod !== "local" || user.role !== "admin" && user.role !== "owner") {
        throw new Error("Identifiants incorrects.");
      }
      const passwordValid = await verifyAdminPassword(input.password, user.passwordHash);
      if (!passwordValid) throw new Error("Identifiants incorrects.");
      await touchUserLastSignedIn(user.id);
      await establishLocalAdminSession(ctx, user);
      return { success: true };
    }),
    activateAdminInvitation: publicProcedure.input(z2.object({
      token: z2.string().regex(/^[a-f0-9]{64}$/),
      password: adminPasswordSchema
    })).mutation(async ({ input, ctx }) => {
      const invitation = await getPendingAdminInvitationByTokenHash(hashInvitationToken(input.token));
      if (!invitation) throw new Error("Ce lien d\u2019activation est invalide, expir\xE9 ou a d\xE9j\xE0 \xE9t\xE9 utilis\xE9.");
      const existingUser = await getUserByEmail(invitation.email);
      if (existingUser) {
        throw new Error("Un compte utilise d\xE9j\xE0 cette adresse e-mail. Demandez au propri\xE9taire de v\xE9rifier l\u2019invitation.");
      }
      const user = {
        openId: `local_admin_${randomUUID2()}`,
        name: invitation.name,
        email: invitation.email,
        passwordHash: await hashAdminPassword(input.password)
      };
      await createLocalAdminAccount(user);
      await markAdminInvitationAccepted(invitation.id);
      await establishLocalAdminSession(ctx, user);
      return { success: true };
    })
  }),
  tutorials: router({
    listPublic: publicProcedure.query(() => getPublishedTutorials()),
    listAdmin: adminProcedure.query(() => getAllTutorials()),
    create: adminProcedure.input(tutorialInput).mutation(async ({ input }) => {
      await createTutorial(input);
      return { success: true };
    }),
    update: adminProcedure.input(tutorialInput.extend({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const { id, ...values } = input;
      await updateTutorial(id, values);
      return { success: true };
    }),
    delete: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      await deleteTutorial(input.id);
      return { success: true };
    })
  }),
  contact: router({
    submit: publicProcedure.input(
      z2.object({
        name: z2.string().trim().min(2).max(160),
        email: z2.email(),
        service: z2.string().trim().min(2).max(160),
        message: z2.string().trim().min(10).max(3e3)
      })
    ).mutation(async ({ input }) => {
      await createContactInquiry(input);
      return { success: true };
    }),
    listAdmin: adminProcedure.query(() => getContactInquiries()),
    updateAdmin: adminProcedure.input(inquiryUpdateInput).mutation(async ({ input }) => {
      const { id, ...values } = input;
      await updateContactInquiry(id, values);
      return { success: true };
    })
  }),
  dashboard: router({
    overview: adminProcedure.query(() => getDashboardOverview())
  }),
  analytics: router({
    recordVisit: publicProcedure.input(z2.object({ visitorId: z2.string().uuid(), path: z2.string().startsWith("/").max(200) })).mutation(async ({ input }) => {
      if (!input.path.startsWith("/admin")) {
        await recordSiteVisit(input.visitorId, input.path);
      }
      return { success: true };
    })
  }),
  admins: router({
    list: ownerProcedure.query(() => getAdminUsers()),
    listInvitations: ownerProcedure.query(() => getAdminInvitations()),
    invitationConfig: ownerProcedure.query(() => ({ configured: isAdminInvitationEmailConfigured() })),
    invite: ownerProcedure.input(inviteAdminInput).mutation(async ({ input, ctx }) => {
      if (!isAdminInvitationEmailConfigured()) {
        throw new Error("L\u2019envoi d\u2019e-mails n\u2019est pas encore configur\xE9. Vous pourrez l\u2019activer plus tard dans les param\xE8tres s\xE9curis\xE9s.");
      }
      const email = normalizeAdminEmail(input.email);
      const existingUser = await getUserByEmail(email);
      if (existingUser) throw new Error("Cette adresse e-mail poss\xE8de d\xE9j\xE0 un compte. G\xE9rez son r\xF4le dans la liste ci-dessous.");
      const token = createInvitationToken();
      const tokenHash = hashInvitationToken(token);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1e3);
      const invitation = await createOrRenewAdminInvitation({
        email,
        name: input.name?.trim() || null,
        tokenHash,
        invitedBy: ctx.user.id,
        expiresAt
      });
      const activationUrl = `${getSafeAppOrigin(input.origin)}/admin/activation?token=${token}`;
      await sendAdminInvitationEmail({
        recipientEmail: email,
        recipientName: invitation.name,
        activationUrl,
        idempotencyKey: `admin-invite-${invitation.id}-${tokenHash.slice(0, 16)}`
      });
      return { success: true, expiresAt };
    }),
    updateRole: ownerProcedure.input(z2.object({ id: z2.number().int().positive(), role: z2.enum(["user", "admin"]) })).mutation(async ({ input, ctx }) => {
      if (input.id === ctx.user.id && input.role !== "admin") {
        throw new Error("Le propri\xE9taire ne peut pas retirer son propre acc\xE8s administrateur.");
      }
      await updateUserRole(input.id, input.role);
      return { success: true };
    })
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
    })
  }),
  content: router({
    list: publicProcedure.query(() => getSiteContentEntries()),
    update: adminProcedure.input(siteContentInput).mutation(async ({ input }) => {
      await upsertSiteContentEntry(input.key, input.value);
      return { success: true };
    })
  }),
  ai: router({
    chat: publicProcedure.input(z2.object({ messages: z2.array(chatbotMessageInput).min(1).max(12) })).mutation(async ({ input }) => {
      const result = await invokeLLM({
        maxTokens: 450,
        messages: [
          { role: "system", content: chatbotSystemPrompt },
          ...input.messages
        ]
      });
      const content = result.choices[0]?.message.content;
      const answer = typeof content === "string" ? content : "Je n\u2019ai pas pu pr\xE9parer une r\xE9ponse pour le moment. Vous pouvez nous \xE9crire via le formulaire de contact.";
      return { content: answer };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api-src/index.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var index_default = app;
export {
  index_default as default
};
