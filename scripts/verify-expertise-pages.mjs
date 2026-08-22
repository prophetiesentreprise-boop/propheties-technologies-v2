import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const viewportName = process.argv[3] ?? "desktop";
const viewport = viewportName === "mobile" ? { width: 375, height: 812 } : { width: 1280, height: 720 };
const cataloguePath = new URL("../client/src/data/serviceExpertises.ts", import.meta.url);
const catalogue = await readFile(cataloguePath, "utf8");
const items = [...catalogue.matchAll(/\{ serviceSlug: "([^"]+)", slug: "([^"]+)", label: "([^"]+)", title: "([^"]+)"/g)].map(([, serviceSlug, slug, label, title]) => ({ serviceSlug, slug, label, title }));

if (items.length !== 24) {
  throw new Error(`Catalogue incomplet : 24 sous-expertises attendues, ${items.length} trouvées.`);
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage({ viewport });
  const results = [];

  for (const item of items) {
    const parentUrl = `${baseUrl}/services/${item.serviceSlug}`;
    const detailPath = `/services/${item.serviceSlug}/${item.slug}`;
    const detailUrl = `${baseUrl}${detailPath}`;

    await page.goto(parentUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(`a[href="${detailPath}"]`);
    const linkedFromParent = await page.locator(`a[href="${detailPath}"]`).count() > 0;
    if (!linkedFromParent) {
      throw new Error(`${item.title} : lien absent de la page parent ${parentUrl}.`);
    }

    await page.goto(detailUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1");
    const title = (await page.locator("h1").first().innerText()).trim();
    const sections = await page.locator("section").count();
    const hasScope = await page.getByText("Le périmètre de la prestation", { exact: true }).count() > 0;
    const hasDeliverables = await page.getByText("Ce que nous livrons", { exact: true }).count() > 0;
    const hasObjectives = await page.getByText("Les résultats attendus", { exact: true }).count() > 0;

    if (title !== item.title || sections < 5 || !hasScope || !hasDeliverables || !hasObjectives) {
      throw new Error(`${item.title} : page détaillée incomplète ou mal associée.`);
    }

    results.push({ title: item.title, detailPath, linkedFromParent, sections });
  }

  console.log(JSON.stringify({ baseUrl, viewportName, viewport, checked: results.length, results }, null, 2));
} finally {
  await browser.close();
}
