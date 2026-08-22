import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createTutorial: vi.fn(),
  updateTutorial: vi.fn(),
  deleteTutorial: vi.fn(),
  getAllTutorials: vi.fn(),
  getPublishedTutorials: vi.fn(),
  createContactInquiry: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function makeAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "propheties-owner",
      email: "owner@example.com",
      name: "Owner",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const tutorial = {
  title: "Créer un mot de passe robuste",
  description: "Une méthode simple pour créer et conserver un mot de passe robuste.",
  videoUrl: "https://www.youtube.com/watch?v=sample-video",
  isPublished: true,
};

describe("tutorials administrative mutations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a tutorial with the submitted publication state", async () => {
    const caller = appRouter.createCaller(makeAdminContext());

    await expect(caller.tutorials.create(tutorial)).resolves.toEqual({ success: true });
    expect(dbMocks.createTutorial).toHaveBeenCalledWith(tutorial);
  });

  it("updates only the requested tutorial with validated values", async () => {
    const caller = appRouter.createCaller(makeAdminContext());

    await expect(caller.tutorials.update({ id: 9, ...tutorial, isPublished: false })).resolves.toEqual({ success: true });
    expect(dbMocks.updateTutorial).toHaveBeenCalledWith(9, { ...tutorial, isPublished: false });
  });

  it("deletes the requested tutorial", async () => {
    const caller = appRouter.createCaller(makeAdminContext());

    await expect(caller.tutorials.delete({ id: 9 })).resolves.toEqual({ success: true });
    expect(dbMocks.deleteTutorial).toHaveBeenCalledWith(9);
  });

  it("rejects an invalid tutorial before calling the data layer", async () => {
    const caller = appRouter.createCaller(makeAdminContext());

    await expect(caller.tutorials.create({ ...tutorial, title: "x", videoUrl: "not-an-url" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.createTutorial).not.toHaveBeenCalled();
  });
});
