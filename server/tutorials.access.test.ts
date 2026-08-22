import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("tutorials access control", () => {
  it("rejects the admin list for a non-admin account", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.tutorials.listAdmin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exposes the public tutorial list without requiring authentication", async () => {
    const ctx = { ...makeContext("user"), user: null };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.tutorials.listPublic()).resolves.toEqual([]);
  });
});

describe("public input validation", () => {
  it("rejects an incomplete contact request before it reaches the database", async () => {
    const ctx = { ...makeContext("user"), user: null };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.submit({
      name: "A",
      email: "invalid-email",
      service: "",
      message: "court",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an empty chatbot conversation before invoking the model", async () => {
    const ctx = { ...makeContext("user"), user: null };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ai.chat({ messages: [] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
