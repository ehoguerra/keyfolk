import { expect, type Page } from "@playwright/test";

export interface SeedLine {
  productId: string;
  selection?: Record<string, string>;
  qty?: number;
}

const keyOf = (productId: string, selection: Record<string, string>) =>
  `${productId}::${Object.keys(selection)
    .sort()
    .map((k) => `${k}=${selection[k]}`)
    .join(";")}`;

/** Puts items in the persisted cart before any page script runs. */
export async function seedCart(page: Page, lines: SeedLine[], coupon: string | null = null) {
  const state = {
    state: {
      lines: lines.map((l) => ({
        key: keyOf(l.productId, l.selection ?? {}),
        productId: l.productId,
        selection: l.selection ?? {},
        qty: l.qty ?? 1,
      })),
      coupon,
    },
    version: 1,
  };
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem("__seeded")) {
      localStorage.setItem("keyfolk-cart", value);
      sessionStorage.setItem("__seeded", "1");
    }
  }, JSON.stringify(state));
}

/** Collects console errors (and optionally warnings) plus uncaught exceptions for the page's lifetime. */
export function trackErrors(page: Page, ignore: RegExp[] = [], { warnings = false } = {}) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error" && !(warnings && msg.type() === "warning")) return;
    const text = msg.text();
    if (ignore.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

export async function waitForHero(page: Page) {
  await expect(page.getByTestId("hero-stage")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
}

export async function waitForViewer(page: Page) {
  await expect(page.getByTestId("product-viewer")).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
}

/** The <main> landmark: avoids matching the (closed) cart drawer that also lives in the DOM. */
export const main = (page: Page) => page.locator("#conteudo");

export async function cartCount(page: Page) {
  return page.getByTestId("cart-count");
}
