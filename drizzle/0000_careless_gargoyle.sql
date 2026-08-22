CREATE TYPE "public"."admin_invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."contact_inquiry_status" AS ENUM('new', 'in_progress', 'responded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'owner');--> statement-breakpoint
CREATE TABLE "adminInvitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(160),
	"tokenHash" varchar(64) NOT NULL,
	"status" "admin_invitation_status" DEFAULT 'pending' NOT NULL,
	"invitedBy" integer,
	"expiresAt" timestamp NOT NULL,
	"acceptedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "adminInvitations_email_unique" UNIQUE("email"),
	CONSTRAINT "adminInvitations_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "contactInquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"service" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"status" "contact_inquiry_status" DEFAULT 'new' NOT NULL,
	"adminNote" text,
	"replyDraft" text,
	"respondedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siteContentEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(120) NOT NULL,
	"value" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "siteContentEntries_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "siteVisits" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitorId" varchar(64) NOT NULL,
	"path" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siteVisuals" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot" varchar(80) NOT NULL,
	"imageUrl" varchar(1024) NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "siteVisuals_slot_unique" UNIQUE("slot")
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"videoUrl" varchar(1024) NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"passwordHash" varchar(255),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "adminInvitations_status_idx" ON "adminInvitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "adminInvitations_expiresAt_idx" ON "adminInvitations" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "siteVisits_createdAt_idx" ON "siteVisits" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "siteVisits_visitorId_idx" ON "siteVisits" USING btree ("visitorId");