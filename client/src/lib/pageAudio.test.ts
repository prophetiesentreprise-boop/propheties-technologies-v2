import { describe, expect, it } from "vitest";
import { getAudioUnavailableMessage, getPageAudioTitle, getReadablePageText } from "./pageAudio";

describe("pageAudio", () => {
  it("associe les pages publiques à un libellé audio clair", () => {
    expect(getPageAudioTitle("/a-propos")).toBe("la présentation de Propheties Technologies");
    expect(getPageAudioTitle("/services/reseaux")).toBe("la présentation de ce service");
  });

  it("normalise et limite le texte lu pour éviter une lecture interminable", () => {
    expect(getReadablePageText("  Bonjour\n\nAbidjan  ")).toBe("Bonjour Abidjan");
    expect(getReadablePageText("Une phrase très longue. Une autre phrase.", 30)).toBe("Une phrase très longue. Fin de l’extrait.");
  });

  it("prépare un message explicite pour les navigateurs sans lecture vocale", () => {
    expect(getAudioUnavailableMessage()).toContain("n’est pas disponible");
  });
});
