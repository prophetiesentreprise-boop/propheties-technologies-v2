import { chromium } from "playwright-core";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
];

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
});

try {
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("audio", { state: "attached" });

    const metadata = await page.locator("audio").first().evaluate(async (audio) => {
      if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise((resolve, reject) => {
          audio.addEventListener("loadedmetadata", resolve, { once: true });
          audio.addEventListener("error", () => reject(new Error("La narration ne se charge pas.")), { once: true });
          audio.load();
        });
      }
      return { readyState: audio.readyState, duration: audio.duration, source: audio.currentSrc };
    });

    if (metadata.readyState < 1 || !Number.isFinite(metadata.duration) || metadata.duration <= 0) {
      throw new Error(`${viewport.name}: métadonnées audio invalides.`);
    }

    const listenButton = page.locator('button[aria-label^="Écouter"]:visible').first();
    const pauseButton = page.locator('button[aria-label="Mettre la lecture en pause"]:visible').first();
    const resumeButton = page.locator('button[aria-label^="Reprendre la lecture"]:visible').first();
    const stopButton = page.locator('button[aria-label="Arrêter la lecture"]:visible').first();

    await listenButton.click();
    await pauseButton.waitFor();
    await pauseButton.click();
    await resumeButton.waitFor();
    await resumeButton.click();
    await pauseButton.waitFor();
    await stopButton.click();
    await page.getByText("Lecture arrêtée.", { exact: true }).waitFor();

    results.push({ viewport: viewport.name, ...metadata, commands: ["lecture", "pause", "reprise", "arrêt"] });
    await page.close();
  }

  console.log(JSON.stringify({ baseUrl, results }, null, 2));
} finally {
  await browser.close();
}
