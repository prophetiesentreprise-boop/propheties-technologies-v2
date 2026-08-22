import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const headerSource = readFileSync(new URL("./SiteHeader.tsx", import.meta.url), "utf8");
const footerSource = readFileSync(new URL("./SiteFooter.tsx", import.meta.url), "utf8");

function getLogoMarkup(source: string) {
  const markup = source.match(/<img src=\{brandAssets\.logo\}[\s\S]*?\/>/);
  if (!markup) throw new Error("Le logo de marque doit être rendu par le composant partagé.");
  return markup[0];
}

describe("Cadrage du logo partagé", () => {
  it("affiche le logo de l’en-tête sans zoom susceptible de le rogner", () => {
    const logoMarkup = getLogoMarkup(headerSource);

    expect(logoMarkup).toContain('className="size-full object-contain');
    expect(logoMarkup).not.toContain("scale-[");
    expect(headerSource).not.toMatch(/brandAssets\.logo[\s\S]{0,180}overflow-hidden/);
  });

  it("affiche le logo du pied de page sans zoom susceptible de le rogner", () => {
    const logoMarkup = getLogoMarkup(footerSource);

    expect(logoMarkup).toContain('className="size-full object-contain"');
    expect(logoMarkup).not.toContain("scale-[");
    expect(footerSource).not.toMatch(/brandAssets\.logo[\s\S]{0,180}overflow-hidden/);
  });
});
