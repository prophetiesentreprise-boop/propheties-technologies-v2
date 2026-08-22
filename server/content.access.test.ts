import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getSiteContentEntries: vi.fn(),
  upsertSiteContentEntry: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function makeContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "propheties-owner",
      email: "owner@example.com",
      name: "Owner",
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

describe("content management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("expose les contenus enregistrés à la partie publique", async () => {
    const savedContent = [{ key: "home.hero.title", value: "Un titre personnalisé" }];
    dbMocks.getSiteContentEntries.mockResolvedValue(savedContent);
    const caller = appRouter.createCaller({ ...makeContext("user"), user: null });

    await expect(caller.content.list()).resolves.toEqual(savedContent);
  });

  it("enregistre une modification owner pour publication immédiate", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));

    await expect(caller.content.update({ key: "service.cybersecurite.promise", value: "Une promesse mise à jour" })).resolves.toEqual({ success: true });
    expect(dbMocks.upsertSiteContentEntry).toHaveBeenCalledWith("service.cybersecurite.promise", "Une promesse mise à jour");
  });

  it("refuse toute modification de contenu par un visiteur non owner", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.content.update({ key: "home.hero.title", value: "Modification interdite" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.upsertSiteContentEntry).not.toHaveBeenCalled();
  });
});
