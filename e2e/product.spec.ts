import { expect, test } from "@playwright/test";
import { trackErrors, waitForViewer } from "./helpers";

test.describe("Produto", () => {
  test("variant selection updates price, add to cart updates the badge", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/produto/folk-75");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Folk 75");
    const price = page.getByTestId("product-price");
    await expect(price).toContainText("1.890,00");

    // Tactile switch costs R$ 20 more.
    await page.getByTestId("switch-degrau").click();
    await expect(page.getByTestId("switch-degrau").locator("input")).toBeChecked();
    await expect(price).toContainText("1.910,00");

    // Case colour swaps the poster and the legend.
    await page.getByTestId("case-grafite").click();
    await expect(page.getByTestId("case-grafite").locator("input")).toBeChecked();
    await expect(page.getByRole("group", { name: /Cor do case: Grafite/ })).toBeVisible();

    // The sold-out switch can't be chosen.
    await expect(page.getByTestId("switch-estalo").locator("input")).toBeDisabled();

    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await expect(page.getByTestId("toast")).toContainText("Adicionado ao carrinho");
    await expect(page.getByTestId("live-region")).toContainText("Folk 75 (Case Grafite, switch Degrau) adicionado ao carrinho");

    // Quantity stepper adds several at once to the same line.
    await page.getByRole("group", { name: "Quantidade" }).getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("3");

    await page.getByTestId("cart-button").click();
    const drawer = page.getByRole("dialog", { name: /Seu carrinho/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId("cart-line")).toHaveCount(1);
    await expect(drawer.getByTestId("cart-line")).toContainText("Case Grafite, switch Degrau");
    expect(errors).toEqual([]);
  });

  test("3D viewer loads over the poster without layout shift", async ({ page }) => {
    await page.goto("/produto/folk-75");
    const viewer = page.getByTestId("product-viewer");
    const before = await viewer.boundingBox();
    await waitForViewer(page);
    const after = await viewer.boundingBox();
    expect(after?.height).toBe(before?.height);
    await expect(viewer.locator("canvas")).toHaveCount(1);
  });

  test("buy now adds the item and goes straight to checkout", async ({ page }) => {
    await page.goto("/produto/degrau");
    await page.getByTestId("pack-90").click();
    await expect(page.getByTestId("product-price")).toContainText("329,00");
    await page.getByTestId("buy-now").click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    await expect(page.getByTestId("checkout-form")).toContainText("pack com 90");
  });

  test("sold-out product offers a local restock reminder", async ({ page }) => {
    await page.goto("/produto/estalo");
    await expect(page.getByTestId("add-to-cart")).toHaveCount(0);
    const notify = page.getByTestId("notify-me");
    await expect(notify).toHaveAttribute("aria-pressed", "false");
    await notify.click();
    await expect(notify).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByTestId("notify-me")).toHaveAttribute("aria-pressed", "true");
  });

  test("favorite toggle feeds the wishlist page", async ({ page }) => {
    await page.goto("/produto/noturno");
    await page.getByTestId("favorite-toggle").click();
    await expect(page.getByTestId("favorite-toggle")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/favoritos");
    await expect(page.getByTestId("favorites-grid")).toContainText("Noturno");
  });

  test("delivery estimate by CEP", async ({ page }) => {
    await page.goto("/produto/folk-65");
    await page.getByTestId("delivery-cep").fill("01310100");
    await page.getByTestId("delivery-cep").press("Enter");
    await expect(page.getByTestId("delivery-result")).toBeVisible();
    await expect(page.getByTestId("delivery-result")).toContainText(/PAC|SEDEX/);
  });
});
