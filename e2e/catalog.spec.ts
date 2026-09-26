import { expect, test, type Page } from "@playwright/test";

const grid = (page: Page) => page.getByTestId("product-grid");
const cards = (page: Page) => grid(page).getByTestId("product-card");

/** On small screens the filters live in a <dialog> sheet. */
async function withFilters(page: Page, fn: () => Promise<void>) {
  const opener = page.getByRole("button", { name: /^Filtros/ });
  const inSheet = await opener.isVisible();
  if (inSheet) {
    await opener.click();
    await expect(page.getByRole("dialog", { name: "Filtros" })).toBeVisible();
  }
  await fn();
  if (inSheet) {
    await page.getByRole("dialog", { name: "Filtros" }).getByRole("button", { name: /^Ver \d+ produtos?/ }).click();
    await expect(page.getByRole("dialog", { name: "Filtros" })).toBeHidden();
  }
}

const scope = async (page: Page) => {
  const sheet = page.getByRole("dialog", { name: "Filtros" });
  return (await sheet.isVisible()) ? sheet : page.getByRole("complementary", { name: "Filtros" });
};

test.describe("Catálogo", () => {
  test("lists the whole catalog and filters by category via the URL", async ({ page }) => {
    await page.goto("/loja");
    await expect(page.getByRole("heading", { level: 1, name: "Loja" })).toBeVisible();
    await expect(page.getByTestId("result-count")).toHaveText("15 produtos");
    await expect(cards(page)).toHaveCount(15);

    await page.getByRole("navigation", { name: "Categorias" }).getByRole("link", { name: /Switches/ }).click();
    await expect(page).toHaveURL(/\/loja\?cat=switches$/);
    await expect(page.getByRole("heading", { level: 1, name: "Switches" })).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    await expect(grid(page)).toContainText("Degrau");
  });

  test("combines filters, keeps them in the URL and restores them from a shared link", async ({ page }) => {
    await page.goto("/loja?cat=switches");
    await expect(cards(page)).toHaveCount(3);

    await withFilters(page, async () => {
      const s = await scope(page);
      await s.getByText("Só em estoque", { exact: true }).click();
    });
    await expect(page).toHaveURL(/estoque=1/);
    await expect(cards(page)).toHaveCount(2);
    await expect(grid(page)).not.toContainText("Estalo");

    await withFilters(page, async () => {
      const s = await scope(page);
      await s.getByText("Tátil", { exact: true }).click();
    });
    await expect(page).toHaveURL(/switch=tatil/);
    await expect(cards(page)).toHaveCount(1);
    await expect(grid(page)).toContainText("Degrau");

    // A shared link lands on exactly the same view.
    const shared = page.url();
    const fresh = await page.context().newPage();
    await fresh.goto(shared);
    await expect(fresh.getByTestId("product-grid").getByTestId("product-card")).toHaveCount(1);
    await expect(fresh.getByTestId("result-count")).toHaveText("1 produto");
    await fresh.close();
  });

  test("keyboard layout filter from a deep link", async ({ page }) => {
    await page.goto("/loja?cat=teclados&layout=75");
    await expect(cards(page)).toHaveCount(1);
    await expect(grid(page)).toContainText("Folk 75");
  });

  test("text search is accent-insensitive and synced to ?q=", async ({ page }) => {
    await page.goto("/loja");
    await page.getByTestId("catalog-search").fill("tatil");
    await expect(page).toHaveURL(/q=tatil/);
    await expect(grid(page)).toContainText("Degrau");
    await expect(page.getByTestId("result-count")).toContainText("para “tatil”");
  });

  test("sort by lowest price puts the cheapest product first", async ({ page }) => {
    await page.goto("/loja");
    await page.getByTestId("catalog-sort").selectOption("menor-preco");
    await expect(page).toHaveURL(/ordem=menor-preco/);
    await expect(cards(page).first()).toContainText("179");
    await page.getByTestId("catalog-sort").selectOption("maior-preco");
    await expect(cards(page).first()).toContainText("Folk TKL");
  });

  test("empty state offers to clear the filters", async ({ page }) => {
    await page.goto("/loja");
    await page.getByTestId("catalog-search").fill("xyzzy-nada");
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("result-count")).toContainText("0 produtos");
    await page.getByTestId("empty-state").getByRole("button", { name: "Limpar filtros" }).click();
    await expect(page.getByTestId("empty-state")).toBeHidden();
    await expect(cards(page)).toHaveCount(15);
    await expect(page).toHaveURL(/\/loja$/);
  });

  test("product cards link to their product page", async ({ page }) => {
    await page.goto("/loja?cat=deskmats");
    await expect(cards(page)).toHaveCount(2);
    await cards(page).filter({ hasText: "Topografia" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/\/produto\/topografia$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Topografia");
  });
});
