import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createLocalAdminAccount: vi.fn(),
  createOrRenewAdminInvitation: vi.fn(),
  createContactInquiry: vi.fn(),
  createTutorial: vi.fn(),
  deleteTutorial: vi.fn(),
  getAdminUsers: vi.fn(),
  getAdminInvitations: vi.fn(),
  getAllTutorials: vi.fn(),
  getAcceptedAdminInvitationByTokenHash: vi.fn(),
  getContactInquiries: vi.fn(),
  getDashboardOverview: vi.fn(),
  getPublishedTutorials: vi.fn(),
  getSiteContentEntries: vi.fn(),
  getSiteVisuals: vi.fn(),
  getPendingAdminInvitationByTokenHash: vi.fn(),
  getUserByEmail: vi.fn(),
  markAdminInvitationAccepted: vi.fn(),
  recordSiteVisit: vi.fn(),
  touchUserLastSignedIn: vi.fn(),
  upsertSiteContentEntry: vi.fn(),
  upsertSiteVisual: vi.fn(),
  updateContactInquiry: vi.fn(),
  updateTutorial: vi.fn(),
  updateUserRole: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/env", () => ({ ENV: { ownerOpenId: "owner-open-id" } }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { appRouter } from "./routers";

function makeContext(role: "user" | "admin" | "owner", openId = "admin-open-id"): TrpcContext {
  return {
    user: {
      id: openId === "owner-open-id" ? 1 : 2,
      openId,
      email: "admin@prophetiestechnologies.com",
      name: "Administrateur",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("dashboard and administration management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exposes dashboard indicators, including real visit counts, to an administrator but not to a regular user", async () => {
    dbMocks.getDashboardOverview.mockResolvedValue({ totalInquiries: 3, pendingInquiries: 2, respondedInquiries: 1, totalTutorials: 4, totalAdmins: 1, visitorsToday: 5, pageViewsToday: 8, uniqueVisitorsLast30Days: 17, pageViewsLast30Days: 34, recentInquiries: [] });

    await expect(appRouter.createCaller(makeContext("admin")).dashboard.overview()).resolves.toMatchObject({ totalInquiries: 3, pendingInquiries: 2, visitorsToday: 5, pageViewsLast30Days: 34 });
    await expect(appRouter.createCaller(makeContext("user")).dashboard.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("stores an administrator's contact follow-up without exposing it publicly", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));

    await expect(caller.contact.updateAdmin({ id: 7, status: "responded", adminNote: "Relance prévue mardi.", replyDraft: "Bonjour, merci pour votre demande." })).resolves.toEqual({ success: true });
    expect(dbMocks.updateContactInquiry).toHaveBeenCalledWith(7, { status: "responded", adminNote: "Relance prévue mardi.", replyDraft: "Bonjour, merci pour votre demande." });
  });

  it("reserves administrator role changes to the persistent owner role", async () => {
    const nonOwner = appRouter.createCaller(makeContext("admin"));
    const owner = appRouter.createCaller(makeContext("owner"));

    await expect(nonOwner.admins.updateRole({ id: 8, role: "admin" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(owner.admins.updateRole({ id: 8, role: "admin" })).resolves.toEqual({ success: true });
    expect(dbMocks.updateUserRole).toHaveBeenCalledWith(8, "admin");
  });

  it("reserves invitation information to the persistent owner role", async () => {
    const nonOwner = appRouter.createCaller(makeContext("admin"));
    await expect(nonOwner.admins.invitationConfig()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not expose a password hash through the authenticated user response", async () => {
    const caller = appRouter.createCaller(makeContext("owner"));
    const currentUser = await caller.auth.me();
    expect(currentUser).toMatchObject({ role: "owner", email: "admin@prophetiestechnologies.com" });
    expect(currentUser).not.toHaveProperty("passwordHash");
  });

  it("only authorizes the local login entry associated with an accepted invitation", async () => {
    dbMocks.getAcceptedAdminInvitationByTokenHash.mockResolvedValueOnce({ id: 12, email: "invite@prophetiestechnologies.com", status: "accepted" });
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.auth.canAccessAdminLogin({ entry: "a".repeat(64) })).resolves.toEqual({ allowed: true });
    expect(dbMocks.getAcceptedAdminInvitationByTokenHash).toHaveBeenCalledWith(expect.any(String));

    dbMocks.getAcceptedAdminInvitationByTokenHash.mockResolvedValueOnce(undefined);
    await expect(caller.auth.canAccessAdminLogin({ entry: "b".repeat(64) })).resolves.toEqual({ allowed: false });
  });

  it("prevents the owner from revoking their own administrator role", async () => {
    const owner = appRouter.createCaller(makeContext("owner", "owner-open-id"));

    await expect(owner.admins.updateRole({ id: 1, role: "user" })).rejects.toThrow("Le propriétaire ne peut pas retirer son propre accès administrateur.");
    expect(dbMocks.updateUserRole).not.toHaveBeenCalled();
  });

  it("records only public page visits and excludes administration routes", async () => {
    const visitorId = "550e8400-e29b-41d4-a716-446655440000";
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.analytics.recordVisit({ visitorId, path: "/services" })).resolves.toEqual({ success: true });
    expect(dbMocks.recordSiteVisit).toHaveBeenCalledWith(visitorId, "/services");

    dbMocks.recordSiteVisit.mockClear();
    await expect(caller.analytics.recordVisit({ visitorId, path: "/admin/demandes" })).resolves.toEqual({ success: true });
    expect(dbMocks.recordSiteVisit).not.toHaveBeenCalled();
  });
});
