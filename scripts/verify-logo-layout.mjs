import { chromium } from "playwright-core";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 375, height: 812 },
];

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    await page.goto(baseUrl, { waitUntil: "networkidle" });

    const measurement = await page.evaluate(() => {
      const logoLink = document.querySelector('a[aria-label="Propheties Technologies — Accueil"]');
      const logo = logoLink?.querySelector("img");
      const footerLogo = document.querySelector('footer img[alt="Propheties Technologies"]');
      const audioControl = Array.from(document.querySelectorAll("header button")).find((control) => {
        const bounds = control.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0;
      });

      if (!(logoLink instanceof HTMLElement) || !(logo instanceof HTMLImageElement) || !(footerLogo instanceof HTMLImageElement)) {
        throw new Error("Logo d’en-tête ou de pied de page introuvable.");
      }

      const frame = logoLink.getBoundingClientRect();
      const image = logo.getBoundingClientRect();
      const footerFrame = footerLogo.parentElement?.getBoundingClientRect();
      const footerImage = footerLogo.getBoundingClientRect();
      const audio = audioControl instanceof HTMLElement ? audioControl.getBoundingClientRect() : null;
      const style = getComputedStyle(logo);
      const footerStyle = getComputedStyle(footerLogo);

      if (!footerFrame) throw new Error("Cadre du logo de pied de page introuvable.");

      return {
        frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom, width: frame.width, height: frame.height },
        image: { left: image.left, top: image.top, right: image.right, bottom: image.bottom, width: image.width, height: image.height },
        footerFrame: { left: footerFrame.left, top: footerFrame.top, right: footerFrame.right, bottom: footerFrame.bottom, width: footerFrame.width, height: footerFrame.height },
        footerImage: { left: footerImage.left, top: footerImage.top, right: footerImage.right, bottom: footerImage.bottom, width: footerImage.width, height: footerImage.height },
        audio: audio ? { left: audio.left, top: audio.top, right: audio.right, bottom: audio.bottom } : null,
        objectFit: style.objectFit,
        transform: style.transform,
        footerObjectFit: footerStyle.objectFit,
        footerTransform: footerStyle.transform,
      };
    });

    const fitsFrame =
      measurement.image.left >= measurement.frame.left &&
      measurement.image.top >= measurement.frame.top &&
      measurement.image.right <= measurement.frame.right &&
      measurement.image.bottom <= measurement.frame.bottom;
    const hasNoZoomTransform = measurement.transform === "none";
    const avoidsAudioOverlap = !measurement.audio || measurement.frame.right <= measurement.audio.left || measurement.frame.left >= measurement.audio.right;
    const footerFitsFrame =
      measurement.footerImage.left >= measurement.footerFrame.left &&
      measurement.footerImage.top >= measurement.footerFrame.top &&
      measurement.footerImage.right <= measurement.footerFrame.right &&
      measurement.footerImage.bottom <= measurement.footerFrame.bottom;
    const footerHasNoZoomTransform = measurement.footerTransform === "none";

    if (!fitsFrame || measurement.objectFit !== "contain" || !hasNoZoomTransform || !avoidsAudioOverlap || !footerFitsFrame || measurement.footerObjectFit !== "contain" || !footerHasNoZoomTransform) {
      throw new Error(`${viewport.name}: un logo ne respecte pas le cadrage attendu.`);
    }

    results.push({ viewport: viewport.name, ...measurement, fitsFrame, hasNoZoomTransform, avoidsAudioOverlap, footerFitsFrame, footerHasNoZoomTransform });
    await page.close();
  }

  console.log(JSON.stringify({ baseUrl, results }, null, 2));
} finally {
  await browser.close();
}
