import { describe, expect, it } from "vitest";

describe("identifiants Resend", () => {
  it("autorise une requête légère aux domaines sans envoyer d’e-mail", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY doit être configurée").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.ok, `Resend a répondu ${response.status}`).toBe(true);
  }, 15_000);
});
