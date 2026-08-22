import { describe, expect, it } from "vitest";
import { createInvitationToken, hashAdminPassword, hashInvitationToken, normalizeAdminEmail, verifyAdminPassword } from "./adminCredentials";

describe("admin credential helpers", () => {
  it("normalizes e-mail addresses before they are persisted", () => {
    expect(normalizeAdminEmail("  Admin@ProphetiesTechnologies.com ")).toBe("admin@prophetiestechnologies.com");
  });

  it("creates opaque invitation tokens and retains only their hash", () => {
    const token = createInvitationToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(hashInvitationToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashInvitationToken(token)).not.toBe(token);
  });

  it("stores a salted password hash and verifies only the correct password", async () => {
    const storedHash = await hashAdminPassword("UnePhraseDePasseTresSolide!2026");
    expect(storedHash).toMatch(/^scrypt\$/);
    await expect(verifyAdminPassword("UnePhraseDePasseTresSolide!2026", storedHash)).resolves.toBe(true);
    await expect(verifyAdminPassword("mot-de-passe-invalide", storedHash)).resolves.toBe(false);
  });
});
