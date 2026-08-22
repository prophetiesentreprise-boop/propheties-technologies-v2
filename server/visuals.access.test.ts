import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getSiteVisuals: vi.fn(),
  upsertSiteVisual: vi.fn(),
}));
const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

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

const dataBase64 = Buffer.from("image-bytes-for-visual-validation-and-upload").toString("base64");

describe("visuals management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMocks.storagePut.mockResolvedValue({ key: "site-visuals/homeHero.jpg", url: "https://example.test/homeHero.jpg" });
  });

  it("allows public visitors to retrieve current visual settings", async () => {
    dbMocks.getSiteVisuals.mockResolvedValue([{ slot: "homeHero", imageUrl: "https://example.test/homeHero.jpg" }]);
    const caller = appRouter.createCaller({ ...makeContext("user"), user: null });

    await expect(caller.visuals.list()).resolves.toEqual([{ slot: "homeHero", imageUrl: "https://example.test/homeHero.jpg" }]);
  });

  it("uploads and stores a valid image only for an owner", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));

    await expect(caller.visuals.upload({ slot: "homeHero", contentType: "image/jpeg", dataBase64 })).resolves.toEqual({ url: "https://example.test/homeHero.jpg" });
    expect(storageMocks.storagePut).toHaveBeenCalledWith("site-visuals/homeHero.jpg", expect.any(Buffer), "image/jpeg");
    expect(dbMocks.upsertSiteVisual).toHaveBeenCalledWith("homeHero", "https://example.test/homeHero.jpg");
  });

  it("allows an owner to replace a service method illustration", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));

    await expect(caller.visuals.upload({ slot: "methodNetwork", contentType: "image/jpeg", dataBase64 })).resolves.toEqual({ url: "https://example.test/homeHero.jpg" });
    expect(storageMocks.storagePut).toHaveBeenCalledWith("site-visuals/methodNetwork.jpg", expect.any(Buffer), "image/jpeg");
    expect(dbMocks.upsertSiteVisual).toHaveBeenCalledWith("methodNetwork", "https://example.test/homeHero.jpg");
  });

  it("refuses an upload from a non-owner before storage access", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.visuals.upload({ slot: "homeHero", contentType: "image/jpeg", dataBase64 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });

  it("rejects unsupported image types before storage access", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));

    await expect(caller.visuals.upload({ slot: "homeHero", contentType: "image/gif" as "image/jpeg", dataBase64 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });
});
