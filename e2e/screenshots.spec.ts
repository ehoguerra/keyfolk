import { expect, test, type Page } from "@playwright/test";
import { seedCart, trackErrors } from "./helpers";

/**
 * The repeatable visual artifact: full-page screenshots of every main page on desktop and mobile,
 * written to e2e/screenshots/<project>-<page>.png (used by the README), plus the hero in all five colorways.
 */

const OUT = "e2e/screenshots";

// Review sizes: desktop 1440×900 @1x, phone 390×844 @1.75x (the mobile project keeps Pixel 7's UA/touch).
// 1.75x keeps the tallest page under the GPU's 16k texture limit used by fullPageShot below.
test.use({
  viewport: async ({ isMobile }, provide) => provide(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }),
  deviceScaleFactor: async ({ isMobile }, provide) => provide(isMobile ? 1.75 : 1),
});

const SAMPLE_ORDER = {
  number: "KF-482915",
  total: 2034.55,
  payment: "pix",
  shipping: "pac",
  name: "Ana",
  email: "ana.souza@exemplo.com",
  items: 2,
  city: "São Paulo (SP)",
  createdAt: "2026-09-21T14:30:00.000Z",
};

async function settle(page: Page) {
  // Walk the page so lazy images and IntersectionObserver content load, then wait for every image.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  // Only images that are actually rendered (closed dialogs and inactive colorway posters never load).
  await page.waitForFunction(
    () => [...document.images].every((img) => img.complete || !img.checkVisibility({ visibilityProperty: true })),
    undefined,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(600);
}

/**
 * Grows the viewport to the whole document before capturing: Chromium's beyond-viewport capture
 * drops off-screen WebGL canvases, so a plain fullPage shot would show empty 3D stages.
 */
async function fullPageShot(page: Page, path: string) {
  const vp = page.viewportSize()!;
  const { height, dpr } = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    dpr: window.devicePixelRatio,
  }));
  // Past ~16k device pixels the compositor tiles a single viewport incorrectly; fall back to the plain capture.
  const tall = height * dpr <= 16_000;
  if (tall) {
    await page.setViewportSize({ width: vp.width, height });
    await page.waitForTimeout(900);
  }
  await page.screenshot({ path, fullPage: true });
  if (tall) await page.setViewportSize(vp);
}

const shots: Array<{ name: string; path: string; prepare?: (page: Page) => Promise<unknown>; ready?: (page: Page) => Promise<unknown> }> = [
  {
    name: "home",
    path: "/",
    ready: (page) => expect(page.getByTestId("hero-stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 }),
  },
  { name: "loja", path: "/loja" },
  { name: "loja-teclados", path: "/loja?cat=teclados" },
  {
    name: "produto-folk-75",
    path: "/produto/folk-75",
    ready: (page) => expect(page.getByTestId("product-viewer")).toHaveAttribute("data-ready", "true", { timeout: 30_000 }),
  },
  {
    name: "produto-degrau",
    path: "/produto/degrau",
    ready: (page) => expect(page.getByTestId("product-viewer")).toHaveAttribute("data-ready", "true", { timeout: 30_000 }),
  },
  {
    name: "carrinho",
    path: "/carrinho",
    prepare: (page) =>
      seedCart(page, [
        { productId: "kb-folk-75", selection: { case: "laguna", switch: "degrau" } },
        { productId: "kc-noturno" },
        { productId: "sw-creme", selection: { pack: "90" }, qty: 2 },
      ]),
  },
  {
    name: "checkout",
    path: "/checkout",
    prepare: (page) =>
      seedCart(page, [
        { productId: "kb-folk-75", selection: { case: "laguna", switch: "degrau" } },
        { productId: "dm-topografia" },
      ]),
  },
  {
    name: "sucesso",
    path: "/checkout/sucesso",
    prepare: (page) => page.addInitScript((o) => sessionStorage.setItem("keyfolk-order", o), JSON.stringify(SAMPLE_ORDER)),
  },
  {
    name: "favoritos",
    path: "/favoritos",
    prepare: (page) =>
      page.addInitScript(() =>
        localStorage.setItem(
          "keyfolk-favorites",
          JSON.stringify({ state: { ids: ["kb-folk-65", "kc-mochi", "sw-degrau", "ac-cabo"] }, version: 0 }),
        ),
      ),
  },
  { name: "404", path: "/tecla-perdida" },
];

test.describe("Screenshots (artifact)", () => {
  test.describe.configure({ mode: "parallel" });

  for (const shot of shots) {
    test(`full page: ${shot.name}`, async ({ page }, info) => {
      // The 404 document itself is reported as a failed resource; nothing else may error.
      const errors = trackErrors(page, shot.name === "404" ? [/status of 404/] : []);
      await shot.prepare?.(page);
      await page.goto(shot.path);
      await expect(page.locator("h1")).toHaveCount(1);
      await shot.ready?.(page);
      await settle(page);
      await fullPageShot(page, `${OUT}/${info.project.name}-${shot.name}.png`);
      expect(errors).toEqual([]);
    });
  }

  for (const cw of ["laguna", "mochi", "sinal", "matcha", "noturno"]) {
    test(`hero colorway: ${cw}`, async ({ page }, info) => {
      await page.addInitScript((c) => localStorage.setItem("keyfolk-colorway", JSON.stringify({ state: { colorway: c }, version: 0 })), cw);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-colorway", cw);
      await expect(page.getByTestId("hero-stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
      await page.waitForTimeout(1800); // let the settle-in ripple finish
      await page.screenshot({ path: `${OUT}/${info.project.name}-hero-${cw}.png` });
    });
  }
});
