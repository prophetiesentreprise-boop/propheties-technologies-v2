import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 *
 * MIGRÉ : dialecte PostgreSQL (Supabase), à partir du schéma MySQL d'origine Manus.
 * Différences principales avec la version MySQL :
 *  - mysqlTable -> pgTable
 *  - int().autoincrement() -> serial()
 *  - mysqlEnum -> pgEnum (déclaré séparément puis référencé)
 *  - onUpdateNow() n'existe pas nativement en PostgreSQL : la mise à jour de
 *    `updatedAt` est désormais faite explicitement dans server/db.ts à chaque
 *    écriture, plutôt que par un trigger automatique de colonne.
 */

export const roleEnum = pgEnum("role", ["user", "admin", "owner"]);
export const adminInvitationStatusEnum = pgEnum("admin_invitation_status", ["pending", "accepted", "revoked", "expired"]);
export const contactInquiryStatusEnum = pgEnum("contact_inquiry_status", ["new", "in_progress", "responded", "closed"]);

export const users = pgTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const adminInvitations = pgTable("adminInvitations", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  status: adminInvitationStatusEnum("status").default("pending").notNull(),
  invitedBy: integer("invitedBy"),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("adminInvitations_status_idx").on(table.status),
  index("adminInvitations_expiresAt_idx").on(table.expiresAt),
]);

export type AdminInvitation = typeof adminInvitations.$inferSelect;

export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  videoUrl: varchar("videoUrl", { length: 1024 }).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorial = typeof tutorials.$inferInsert;

export const contactInquiries = pgTable("contactInquiries", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ContactInquiry = typeof contactInquiries.$inferSelect;

export const siteVisits = pgTable("siteVisits", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("siteVisits_createdAt_idx").on(table.createdAt),
  index("siteVisits_visitorId_idx").on(table.visitorId),
]);

export type SiteVisit = typeof siteVisits.$inferSelect;

export const siteVisuals = pgTable("siteVisuals", {
  id: serial("id").primaryKey(),
  slot: varchar("slot", { length: 80 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteVisual = typeof siteVisuals.$inferSelect;

export const siteContentEntries = pgTable("siteContentEntries", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteContentEntry = typeof siteContentEntries.$inferSelect;
