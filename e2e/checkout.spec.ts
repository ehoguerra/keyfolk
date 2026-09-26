import { expect, test, type Page } from "@playwright/test";
import { seedCart } from "./helpers";

const VIACEP = "https://viacep.com.br/ws/**";

async function mockViaCep(page: Page) {
  await page.route(VIACEP, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        cep: "01310-100",
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
      }),
    }),
  );
}

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await seedCart(page, [
      { productId: "kb-folk-75", selection: { case: "laguna", switch: "degrau" } },
      { productId: "dm-topografia" },
    ]);
  });

  test("shows inline errors, then places the order and clears the cart", async ({ page }) => {
    await mockViaCep(page);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveText("2");

    // Submitting empty: summary alert, first invalid field focused, fields flagged and described.
    await page.getByTestId("place-order").click();
    await expect(page.getByRole("alert").filter({ hasText: /Faltam corrigir \d+ campos/ })).toBeVisible();
    const email = page.getByLabel("E-mail", { exact: true });
    await expect(email).toBeFocused();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-describedby", /f-email/);
    await expect(page.getByText("Digite seu e-mail para receber a confirmação.")).toBeVisible();
    await expect(page.getByLabel("CPF")).toHaveAttribute("aria-invalid", "true");

    // Masks + a live fix of one error.
    await email.fill("ana@exemplo");
    await expect(page.getByText("Esse e-mail parece incompleto.", { exact: false })).toBeVisible();
    await email.fill("ana.souza@exemplo.com");
    await expect(email).not.toHaveAttribute("aria-invalid", "true");

    await page.getByLabel("Nome completo").fill("Ana Souza");
    await page.getByLabel("Celular").fill("11912345678");
    await expect(page.getByLabel("Celular")).toHaveValue("(11) 91234-5678");
    await page.getByLabel("CPF").fill("52998224725");
    await expect(page.getByLabel("CPF")).toHaveValue("529.982.247-25");

    // CEP lookup (ViaCEP mocked) fills the address.
    await page.getByTestId("checkout-cep").fill("01310100");
    await expect(page.getByTestId("checkout-cep")).toHaveValue("01310-100");
    await expect(page.getByText("Endereço encontrado")).toBeVisible();
    await expect(page.getByLabel("Rua ou avenida")).toHaveValue("Avenida Paulista");
    await expect(page.getByLabel("Bairro")).toHaveValue("Bela Vista");
    await expect(page.getByLabel("Cidade")).toHaveValue("São Paulo");
    await expect(page.getByLabel("UF")).toHaveValue("SP");
    await page.getByLabel("Número", { exact: true }).fill("1578");

    // Free shipping (R$ 2.089) → PAC is free; SEDEX costs extra.
    await expect(page.getByTestId("shipping-pac")).toContainText("Grátis");
    await page.getByTestId("shipping-sedex").click();
    await expect(page.getByTestId("checkout-form")).toContainText("Frete (SEDEX)");

    await page.getByTestId("place-order").click();
    await expect(page).toHaveURL(/\/checkout\/sucesso$/);
    await expect(page.getByTestId("order-success")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Valeu, Ana!");
    await expect(page.getByTestId("order-number")).toHaveText(/^KF-\d{6}$/);
    await expect(page.getByTestId("order-success").locator("svg[role=img]").first()).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    // Reload keeps the confirmation (sessionStorage), cart stays empty.
    const number = await page.getByTestId("order-number").textContent();
    await page.reload();
    await expect(page.getByTestId("order-number")).toHaveText(number ?? "");
  });

  test("card payment validates the card fields", async ({ page }) => {
    await page.goto("/checkout");
    await page.getByTestId("payment-cartao").click();
    await page.getByLabel("Número do cartão").fill("4242424242424241");
    await expect(page.getByLabel("Número do cartão")).toHaveValue("4242 4242 4242 4241");
    await page.getByTestId("place-order").click();
    await expect(page.getByText("Número de cartão inválido. Confira os dígitos.")).toBeVisible();
    await page.getByLabel("Número do cartão").fill("4242424242424242");
    await expect(page.getByText("Número de cartão inválido. Confira os dígitos.")).toBeHidden();
    await expect(page.getByTestId("place-order")).toHaveText(/Finalizar pagamento/);
  });

  test("ViaCEP failure shows a graceful message and keeps the form usable", async ({ page }) => {
    await page.route(VIACEP, (route) => route.abort("internetdisconnected"));
    await page.goto("/checkout");
    await page.getByTestId("checkout-cep").fill("01310100");
    await expect(page.getByTestId("cep-error")).toContainText("Preencha o endereço à mão");
    await page.getByLabel("Rua ou avenida").fill("Rua Augusta");
    await expect(page.getByLabel("Rua ou avenida")).toHaveValue("Rua Augusta");
  });

  test("unknown CEP tells the user", async ({ page }) => {
    await page.route(VIACEP, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ erro: "true" }),
      }),
    );
    await page.goto("/checkout");
    await page.getByTestId("checkout-cep").fill("99999999");
    await expect(page.getByTestId("cep-error")).toContainText("Não encontramos esse CEP");
  });
});

test("empty checkout points back to the shop", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Seu carrinho está vazio");
  await expect(page.getByRole("link", { name: "Ir para a loja" })).toBeVisible();
});
