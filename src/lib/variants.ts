import type { CaseOption, Product } from "@/data/products";

export type Selection = Record<string, string>;

export function defaultSelection(product: Product): Selection {
  const sel: Selection = {};
  const { cases, switches, packs } = product.options;
  if (cases?.length) sel.case = cases[0].id;
  if (switches?.length) sel.switch = (switches.find((s) => !s.soldOut) ?? switches[0]).id;
  if (packs?.length) sel.pack = packs[0].id;
  return sel;
}

/** Normalizes a selection against the product's options (unknown values fall back to defaults). */
export function normalizeSelection(product: Product, input: Partial<Selection>): Selection {
  const base = defaultSelection(product);
  const { cases, switches, packs } = product.options;
  const out: Selection = { ...base };
  if (cases && input.case && cases.some((c) => c.id === input.case)) out.case = input.case;
  if (switches && input.switch && switches.some((s) => s.id === input.switch)) out.switch = input.switch;
  if (packs && input.pack && packs.some((p) => p.id === input.pack)) out.pack = input.pack;
  return out;
}

export function variantKey(selection: Selection): string {
  return Object.keys(selection)
    .sort()
    .map((k) => `${k}=${selection[k]}`)
    .join(";");
}

export function variantPrice(product: Product, selection: Selection): number {
  const { switches, packs } = product.options;
  if (packs && selection.pack) {
    const pack = packs.find((p) => p.id === selection.pack);
    if (pack) return pack.price;
  }
  let price = product.price;
  if (switches && selection.switch) {
    const sw = switches.find((s) => s.id === selection.switch);
    if (sw) price += sw.priceDelta;
  }
  return price;
}

export function selectedCase(product: Product, selection: Selection): CaseOption | undefined {
  return product.options.cases?.find((c) => c.id === selection.case);
}

/** Human description of the chosen variant, e.g. "Case Grafite, switch Degrau". */
export function variantLabel(product: Product, selection: Selection): string {
  const parts: string[] = [];
  const { cases, switches, packs } = product.options;
  const c = cases?.find((x) => x.id === selection.case);
  if (c) parts.push(`Case ${c.name}`);
  const s = switches?.find((x) => x.id === selection.switch);
  if (s) parts.push(s.id === "sem" ? "sem switches" : `switch ${s.name}`);
  const p = packs?.find((x) => x.id === selection.pack);
  if (p) parts.push(`pack com ${p.id}`);
  return parts.join(", ");
}

export function variantImage(product: Product, selection: Selection): string {
  const cases = product.options.cases;
  if (cases?.length && selection.case && selection.case !== cases[0].id) {
    return `/renders/${product.slug}--${selection.case}.webp`;
  }
  return product.render;
}

export function isPurchasable(product: Product, selection: Selection): boolean {
  if (product.status.kind === "sold-out") return false;
  const sw = product.options.switches?.find((s) => s.id === selection.switch);
  return !sw?.soldOut;
}

/** All render slugs this product needs (default + case variants). */
export function renderSlugs(product: Product): string[] {
  const cases = product.options.cases ?? [];
  return [product.slug, ...cases.slice(1).map((c) => `${product.slug}--${c.id}`)];
}
