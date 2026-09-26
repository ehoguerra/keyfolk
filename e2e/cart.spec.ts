import { expect, test } from "@playwright/test";
import { main, seedCart } from "./helpers";

test.describe("Carrinho", () => {
  test("persists after reload", async ({ page }) => {
    await page.goto("/produto/matcha");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.goto("/carrinho");
    await expect(main(page).getByTestId("cart-line")).toHaveCount(1);
    await expect(main(page).getByTestId("cart-line")).toContainText("Matcha");
  });

  test("drawer is a modal dialog: Esc closes it and focus returns to the trigger", async ({ page }) => {
    await seedCart(page, [{ productId: "dm-grade" }]);
    await page.goto("/");
    const trigger = page.getByTestId("cart-button");
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: /Seu carrinho/ });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Grade");
    // Free-shipping progress: R$ 179 of R$ 999.
    await expect(drawer).toContainText(/Faltam R\$\s?820,00/);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("coupon FOLK10 applies 10% and an invalid coupon explains the error", async ({ page }) => {
    await seedCart(page, [{ productId: "kb-folk-65", selection: { case: "laguna", switch: "creme" } }]);
    await page.goto("/carrinho");
    const m = main(page);
    await expect(m.getByTestId("cart-total")).toBeVisible();

    const field = m.getByLabel("Cupom de desconto");
    await field.fill("DESCONTAO");
    await m.getByRole("button", { name: "Aplicar" }).click();
    const err = m.getByRole("alert");
    await expect(err).toContainText("Não encontramos o cupom “DESCONTAO”");
    await expect(field).toHaveAttribute("aria-invalid", "true");

    await field.fill("folk10");
    await m.getByRole("button", { name: "Aplicar" }).click();
    await expect(m.getByTestId("coupon-applied")).toContainText("FOLK10");
    await expect(m.getByTestId("discount-row")).toContainText("129,00");
    await expect(m.getByTestId("cart-total")).toContainText("1.161,00");

    // The coupon survives a reload too.
    await page.reload();
    await expect(main(page).getByTestId("coupon-applied")).toContainText("FOLK10");

    await main(page).getByRole("button", { name: "Remover", exact: true }).click();
    await expect(main(page).getByTestId("discount-row")).toHaveCount(0);
  });

  test("quantity changes and removal on the cart page", async ({ page }) => {
    await seedCart(page, [
      { productId: "sw-creme", selection: { pack: "70" }, qty: 1 },
      { productId: "ac-cabo" },
    ]);
    await page.goto("/carrinho");
    const m = main(page);
    await expect(m.getByTestId("cart-line")).toHaveCount(2);
    await m.getByRole("group", { name: "Quantidade de Creme" }).getByRole("button", { name: "Aumentar quantidade" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("3");
    await m.getByRole("button", { name: /Remover Cabo espiralado/ }).click();
    await expect(m.getByTestId("cart-line")).toHaveCount(1);
    await expect(page.getByTestId("cart-count")).toHaveText("2");
    await m.getByRole("button", { name: /Remover Creme/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seu carrinho está vazio");
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
  });
});
