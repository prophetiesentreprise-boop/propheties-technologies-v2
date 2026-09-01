/**
 * =========================================================================
 * GÉNÉRATION DU SITEMAP — pour le référencement (Google, Bing...)
 * =========================================================================
 * Génère client/public/sitemap.xml à partir des vraies pages du site
 * (y compris les 25 pages de sous-expertises, lues directement depuis
 * serviceExpertises.ts — jamais de liste à recopier ou risque d'oubli).
 *
 * UTILISATION :
 *   npx tsx scripts/generate-sitemap.ts
 *
 * À relancer à chaque fois qu'une page est ajoutée ou retirée du site.
 * =========================================================================
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serviceExpertises } from "../client/src/data/serviceExpertises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.resolve(__dirname, "../client/public/sitemap.xml");
const SITE_URL = "https://www.prophetiestechnologies.com";
const TODAY = new Date().toISOString().slice(0, 10);

const staticPages: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/a-propos", priority: "0.7", changefreq: "monthly" },
  { path: "/tutoriels", priority: "0.6", changefreq: "weekly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/services/reseaux-installations", priority: "0.8", changefreq: "monthly" },
  { path: "/services/cybersecurite", priority: "0.8", changefreq: "monthly" },
  { path: "/services/maintenance-support", priority: "0.8", changefreq: "monthly" },
  { path: "/services/technologie-ia", priority: "0.8", changefreq: "monthly" },
  { path: "/services/formation", priority: "0.8", changefreq: "monthly" },
  { path: "/services/solutions-sur-mesure", priority: "0.8", changefreq: "monthly" },
];

const expertisePages = serviceExpertises.map((expertise) => ({
  path: `/services/${expertise.serviceSlug}/${expertise.slug}`,
  priority: "0.6",
  changefreq: "monthly",
}));

const allPages = [...staticPages, ...expertisePages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(OUTPUT_FILE, xml, "utf-8");
console.log(`\n✅ Sitemap généré : ${allPages.length} pages (${staticPages.length} principales + ${expertisePages.length} sous-expertises).`);
console.log(`   Fichier : client/public/sitemap.xml\n`);
