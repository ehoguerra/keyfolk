#!/usr/bin/env node
/**
 * Renders every product image from our own 3D models.
 *
 *   1. start the dev server:   npm run dev -- -p 3200
 *   2. render everything:       npm run render
 *      or only some slugs:      npm run render -- folk-75 hero-laguna
 *
 * Visits /render/<slug> (a dev-only route), waits for window.__RENDER_READY__,
 * screenshots with a transparent background and writes public/renders/<slug>.webp.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "renders");
const port = process.env.RENDER_PORT ?? process.env.PORT ?? "3200";
const base = `http://localhost:${port}`;
const only = process.argv.slice(2);

async function getManifest(page) {
  await page.goto(`${base}/render/manifest`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  const json = await page.locator("#render-manifest").textContent();
  return JSON.parse(json ?? "[]");
}

const browser = await chromium.launch({ args: ["--enable-gpu", "--use-angle=d3d11"] });
try {
  const probe = await browser.newPage();
  let jobs = await getManifest(probe).catch((err) => {
    console.error(`Não consegui ler ${base}/render/manifest. O servidor de desenvolvimento está rodando?`);
    throw err;
  });
  await probe.close();
  if (only.length) jobs = jobs.filter((j) => only.includes(j.slug));
  if (!jobs.length) {
    console.log("Nada para renderizar.");
    process.exit(0);
  }
  await mkdir(outDir, { recursive: true });

  for (const job of jobs) {
    const t0 = Date.now();
    const context = await browser.newContext({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/render/${job.slug}`, { waitUntil: "load", timeout: 120_000 });
    await page.waitForFunction(() => window.__RENDER_READY__ === true, null, { timeout: 120_000 });
    await page.waitForTimeout(250);
    const png = await page.screenshot({ omitBackground: true, type: "png" });
    const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toBuffer();
    const file = join(outDir, `${job.slug}.webp`);
    await writeFile(file, webp);
    await context.close();
    const kb = (webp.length / 1024).toFixed(0);
    console.log(`✓ ${job.slug.padEnd(28)} ${job.width}×${job.height}  ${kb} KB  ${Date.now() - t0} ms`);
    if (errors.length) console.warn(`  avisos: ${errors.join(" | ")}`);
  }
} finally {
  await browser.close();
}
