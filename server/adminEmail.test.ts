import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/env", () => ({ ENV: { resendApiKey: "", resendFromEmail: "" } }));

import { isAdminInvitationEmailConfigured, sendAdminInvitationEmail } from "./adminEmail";

describe("admin invitation e-mail configuration", () => {
  it("fails closed until the protected sender settings are supplied", async () => {
    expect(isAdminInvitationEmailConfigured()).toBe(false);
    await expect(sendAdminInvitationEmail({
      recipientEmail: "admin@example.com",
      activationUrl: "https://prophetiestechnologies.com/admin/activation?token=abc",
      idempotencyKey: "admin-invite-test",
    })).rejects.toThrow("n’est pas encore configuré");
  });
});
