import { expect, test } from "@playwright/test";
import { trackErrors, waitForHero } from "./helpers";

test.describe("Home", () => {
  test("renders the featured products and a live WebGL keyboard", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Teclados que");
    await expect(page.getByTestId("featured-product")).toHaveCount(4);
    await expect(page.getByTestId("featured-grid")).toContainText("Folk 75");
    await expect(page.getByTestId("featured-grid")).toContainText("Noturno");

    await waitForHero(page);
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-testid=hero-stage] canvas");
      if (!canvas) return false;
      return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    });
    expect(hasWebGL).toBe(true);
    expect(errors).toEqual([]);
  });

  test("typing on the real keyboard presses the matching 3D key", async ({ page }) => {
    await page.goto("/");
    await waitForHero(page);
    const stage = page.getByTestId("hero-stage");

    await page.keyboard.press("k");
    await expect(stage).toHaveAttribute("data-last-key", "KeyK");
    await page.keyboard.press("Enter");
    await expect(stage).toHaveAttribute("data-last-key", "Enter");
    await page.keyboard.press("ArrowLeft");
    await expect(stage).toHaveAttribute("data-last-key", "ArrowLeft");
  });

  test("typing inside a text field does not drive the 3D keyboard", async ({ page }) => {
    await page.goto("/");
    await waitForHero(page);
    const stage = page.getByTestId("hero-stage");
    await page.keyboard.press("q");
    await expect(stage).toHaveAttribute("data-last-key", "KeyQ");

    const email = page.getByLabel("Seu e-mail");
    await email.scrollIntoViewIfNeeded();
    await email.fill("");
    await email.press("z");
    await expect(stage).toHaveAttribute("data-last-key", "KeyQ");
  });

  test("switching colorway retints the site and persists after reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-colorway", "laguna");
    const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.getByTestId("colorway-picker").first().locator("label[data-cw=noturno]").click();
    await expect(page.locator("html")).toHaveAttribute("data-colorway", "noturno");
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor), { timeout: 3000 })
      .not.toBe(bgBefore);

    await page.reload();
    // Set by the inline <head> script before first paint.
    await expect(page.locator("html")).toHaveAttribute("data-colorway", "noturno");
    await expect(page.getByTestId("colorway-noturno").first()).toBeChecked();

    await page.goto("/loja");
    await expect(page.locator("html")).toHaveAttribute("data-colorway", "noturno");
  });

  test("sound toggle is off by default and labelled", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("sound-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toHaveText(/Som: desligado/);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveText(/Som: ligado/);
  });
});
