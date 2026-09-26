import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seedCart } from "./helpers";

// The five colorways recolour the whole site, so accessibility is checked in every one of them.
const COLORWAYS = ["mochi", "laguna", "sinal", "matcha", "noturno"] as const;
const PAGES = ["/", "/loja", "/produto/folk-75", "/carrinho", "/checkout", "/favoritos"];

for (const colorway of COLORWAYS) {
  test(`${colorway}: every page passes axe for WCAG 2.1 AA, contrast included`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.addInitScript(
      ([key, id]) => localStorage.setItem(key, JSON.stringify({ state: { colorway: id }, version: 0 })),
      ["keyfolk-colorway", colorway],
    );
    await seedCart(page, [{ productId: "kb-folk-40-orto", selection: { case: "laguna", switch: "creme" } }]);
    const violations: string[] = [];
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-colorway", colorway);
      // reveal-on-scroll content counts too: bring everything into its final state first
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(700);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      for (const v of result.violations) {
        for (const n of v.nodes.slice(0, 4)) violations.push(`${path} ${v.id}: ${n.target.join(" ")} ${n.failureSummary?.split("\n")[1] ?? ""}`);
      }
    }
    expect(violations).toEqual([]);
  });
}
