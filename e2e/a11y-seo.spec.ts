import { expect, test } from "@playwright/test";
import { seedCart, trackErrors } from "./helpers";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/loja", name: "loja" },
  { path: "/produto/folk-75", name: "produto" },
  { path: "/produto/estalo", name: "produto esgotado" },
  { path: "/carrinho", name: "carrinho" },
  { path: "/checkout", name: "checkout" },
  { path: "/favoritos", name: "favoritos" },
  { path: "/checkout/sucesso", name: "sucesso (sem pedido)" },
];

test.describe("Acessibilidade e SEO (smoke)", () => {
  for (const { path, name } of PAGES) {
    test(`${name}: one h1, alt on every image, landmarks, no console errors or warnings`, async ({ page }) => {
      const errors = trackErrors(page, [], { warnings: true });
      await seedCart(page, [{ productId: "kb-folk-40-orto", selection: { case: "laguna", switch: "creme" } }]);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main#conteudo")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);

      // Every <img> carries an alt attribute (decorative ones use alt="").
      const missingAlt = await page.locator("img:not([alt])").count();
      expect(missingAlt).toBe(0);
      // Content images (not aria-hidden containers) have meaningful alt text.
      const emptyAlt = await page.evaluate(
        () =>
          [...document.querySelectorAll<HTMLImageElement>("img[alt='']")].filter((img) => !img.closest("[aria-hidden='true']")).length,
      );
      expect(emptyAlt).toBe(0);

      // Skip link is the first focusable element and targets <main>.
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
      await expect(skip).toBeFocused();
      await expect(skip).toHaveAttribute("href", "#conteudo");

      // No sideways scrolling at any width.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      await expect(page).toHaveTitle(/Keyfolk/);
      const canonical = await page.locator("link[rel=canonical]").count();
      if (!path.startsWith("/checkout/sucesso")) expect(canonical).toBe(1);
      // (No "networkidle": the 3D text worker keeps a blob: request open.)
      await page.waitForLoadState("load");
      // Long enough for Chromium's "preloaded but not used" check (~3 s after load).
      await page.waitForTimeout(3500);
      expect(errors).toEqual([]);
    });
  }

  test("404 page has personality and a way back", async ({ page }) => {
    const res = await page.goto("/essa-pagina-nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Essa tecla não está no layout.");
    await expect(page.locator("h1")).toHaveCount(1);
    await page.getByRole("link", { name: "Voltar ao início" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("unknown product slug is a 404", async ({ page }) => {
    const res = await page.goto("/produto/teclado-imaginario");
    expect(res?.status()).toBe(404);
  });

  test("product page ships Product JSON-LD with an offer in BRL", async ({ page }) => {
    await page.goto("/produto/folk-75");
    const blocks = await page.locator("script[type='application/ld+json']").allTextContents();
    const product = blocks.map((b) => JSON.parse(b)).find((j) => j["@type"] === "Product");
    expect(product).toBeTruthy();
    expect(product.name).toBe("Folk 75");
    expect(product.offers.priceCurrency).toBe("BRL");
    expect(Number(product.offers.price)).toBe(1890);
    await expect(page.locator("meta[property='og:image']").first()).toHaveAttribute("content", /opengraph-image/);
  });

  test("home ships Organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator("script[type='application/ld+json']").allTextContents();
    expect(blocks.map((b) => JSON.parse(b)["@type"])).toContain("Organization");
  });

  for (const path of ["/", "/loja", "/carrinho"]) {
    test(`${path} has a share image that actually loads`, async ({ page, request }) => {
      await page.goto(path);
      const og = page.locator("meta[property='og:image']").first();
      await expect(og).toHaveAttribute("content", /opengraph-image/);
      const res = await request.get((await og.getAttribute("content"))!.replace(/^https?:\/\/[^/]+/, ""));
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    });
  }

  test("robots, sitemap and manifest are served; the render route is hidden in production", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    const robotsText = await robots.text();
    expect(robotsText).toContain("Disallow: /render/");
    expect(robotsText).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain("/produto/folk-75");
    expect(xml).toContain("/loja");

    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.ok()).toBe(true);
    expect((await manifest.json()).lang).toBe("pt-BR");

    const render = await request.get("/render/folk-75");
    expect(render.status()).toBe(404);
  });

  test("reduced motion: keys still respond to typing", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByTestId("hero-stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
    await page.keyboard.press("j");
    await expect(page.getByTestId("hero-stage")).toHaveAttribute("data-last-key", "KeyJ");
    await context.close();
  });
});
