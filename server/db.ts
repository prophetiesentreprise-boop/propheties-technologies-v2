import { desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  adminInvitations,
  contactInquiries,
  InsertTutorial,
  InsertUser,
  siteContentEntries,
  siteVisits,
  siteVisuals,
  tutorials,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

// MIGRÉ : Postgres (Supabase) via drizzle-orm/postgres-js, au lieu de mysql2.
let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'owner';
      updateSet.role = 'owner';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    updateSet.updatedAt = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalAdminAccount(input: {
  openId: string;
  name: string | null;
  email: string;
  passwordHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(users).values({
    ...input,
    loginMethod: "local",
    role: "admin",
    lastSignedIn: new Date(),
  });
}

export async function createOrRenewAdminInvitation(input: {
  email: string;
  name: string | null;
  tokenHash: string;
  invitedBy: number;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(adminInvitations).values({
    ...input,
    status: "pending",
    acceptedAt: null,
  }).onConflictDoUpdate({
    target: adminInvitations.email,
    set: {
      name: input.name,
      tokenHash: input.tokenHash,
      invitedBy: input.invitedBy,
      expiresAt: input.expiresAt,
      status: "pending",
      acceptedAt: null,
      updatedAt: new Date(),
    },
  });

  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.email, input.email)).limit(1);
  if (!result[0]) throw new Error("Invitation introuvable après enregistrement");
  return result[0];
}

export async function getPendingAdminInvitationByTokenHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.tokenHash, tokenHash)).limit(1);
  const invitation = result[0];
  if (!invitation || invitation.status !== "pending") return undefined;

  if (invitation.expiresAt.getTime() <= Date.now()) {
    await db.update(adminInvitations).set({ status: "expired", updatedAt: new Date() }).where(eq(adminInvitations.id, invitation.id));
    return undefined;
  }

  return invitation;
}

export async function getAcceptedAdminInvitationByTokenHash(tokenHash: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(adminInvitations).where(eq(adminInvitations.tokenHash, tokenHash)).limit(1);
  const invitation = result[0];
  return invitation?.status === "accepted" ? invitation : undefined;
}

export async function markAdminInvitationAccepted(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(adminInvitations).set({ status: "accepted", acceptedAt: new Date(), updatedAt: new Date() }).where(eq(adminInvitations.id, id));
}

export async function getAdminInvitations() {
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
    updatedAt: adminInvitations.updatedAt,
  }).from(adminInvitations).orderBy(desc(adminInvitations.updatedAt));
}

export async function getPublishedTutorials() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(tutorials)
    .where(eq(tutorials.isPublished, true))
    .orderBy(desc(tutorials.createdAt));
}

export async function getAllTutorials() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(tutorials).orderBy(desc(tutorials.createdAt));
}

export async function createTutorial(input: Omit<InsertTutorial, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(tutorials).values(input);
}

export async function updateTutorial(
  id: number,
  input: Pick<InsertTutorial, "title" | "description" | "videoUrl" | "isPublished">,
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(tutorials).set({ ...input, updatedAt: new Date() }).where(eq(tutorials.id, id));
}

export async function deleteTutorial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.delete(tutorials).where(eq(tutorials.id, id));
}

export async function createContactInquiry(input: {
  name: string;
  email: string;
  service: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(contactInquiries).values(input);
}

export async function getContactInquiries() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
}

export async function updateContactInquiry(
  id: number,
  input: {
    status: "new" | "in_progress" | "responded" | "closed";
    adminNote?: string | null;
    replyDraft?: string | null;
  },
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(contactInquiries).set({
    ...input,
    updatedAt: new Date(),
    ...(input.status === "responded" ? { respondedAt: new Date() } : {}),
  }).where(eq(contactInquiries.id, id));
}

export async function getAdminUsers() {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.lastSignedIn));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function touchUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(users).set({ lastSignedIn: new Date(), updatedAt: new Date() }).where(eq(users.id, id));
}

export async function recordSiteVisit(visitorId: string, path: string) {
  const db = await getDb();
  if (!db) return;

  await db.insert(siteVisits).values({ visitorId, path });
}

export async function getDashboardOverview() {
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
      recentInquiries: [],
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLast30Days = new Date(now);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);
  startOfLast30Days.setHours(0, 0, 0, 0);

  const [inquiries, tutorialRows, userRows, visitRows] = await Promise.all([
    db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt)),
    db.select().from(tutorials),
    db.select({ role: users.role }).from(users),
    db.select().from(siteVisits).where(gte(siteVisits.createdAt, startOfLast30Days)),
  ]);

  const visitsToday = visitRows.filter(visit => visit.createdAt >= startOfToday);

  return {
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(inquiry => inquiry.status === "new" || inquiry.status === "in_progress").length,
    respondedInquiries: inquiries.filter(inquiry => inquiry.status === "responded").length,
    totalTutorials: tutorialRows.length,
    totalAdmins: userRows.filter(user => user.role === "admin" || user.role === "owner").length,
    visitorsToday: new Set(visitsToday.map(visit => visit.visitorId)).size,
    pageViewsToday: visitsToday.length,
    uniqueVisitorsLast30Days: new Set(visitRows.map(visit => visit.visitorId)).size,
    pageViewsLast30Days: visitRows.length,
    recentInquiries: inquiries.slice(0, 6),
  };
}

export async function getSiteVisuals() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(siteVisuals);
}

export async function upsertSiteVisual(slot: string, imageUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(siteVisuals).values({ slot, imageUrl }).onConflictDoUpdate({
    target: siteVisuals.slot,
    set: { imageUrl, updatedAt: new Date() },
  });
}

export async function getSiteContentEntries() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(siteContentEntries);
}

export async function upsertSiteContentEntry(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(siteContentEntries).values({ key, value }).onConflictDoUpdate({
    target: siteContentEntries.key,
    set: { value, updatedAt: new Date() },
  });
}
