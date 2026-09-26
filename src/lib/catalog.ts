import {
  CATEGORY_LABEL,
  LAYOUT_LABEL,
  SWITCH_TYPE_LABEL,
  type Category,
  type KeyboardLayoutId,
  type Product,
  type SwitchType,
} from "@/data/products";

export type SortId = "destaques" | "menor-preco" | "maior-preco" | "novidades";
export type PriceRangeId = "ate-300" | "300-1000" | "acima-1000";
export type CategoryFilter = Category | "todos";

export const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "teclados", label: "Teclados" },
  { id: "keycaps", label: "Keycaps" },
  { id: "switches", label: "Switches" },
  { id: "deskmats", label: "Deskmats" },
  { id: "acessorios", label: "Acessórios" },
];

export const SORTS: Array<{ id: SortId; label: string }> = [
  { id: "destaques", label: "Destaques" },
  { id: "menor-preco", label: "Menor preço" },
  { id: "maior-preco", label: "Maior preço" },
  { id: "novidades", label: "Novidades" },
];

export const PRICE_RANGES: Array<{ id: PriceRangeId; label: string; min: number; max: number }> = [
  { id: "ate-300", label: "Até R$ 300", min: 0, max: 300 },
  { id: "300-1000", label: "R$ 300 a R$ 1.000", min: 300, max: 1000 },
  { id: "acima-1000", label: "Acima de R$ 1.000", min: 1000, max: Number.POSITIVE_INFINITY },
];

export const LAYOUT_FILTERS = (Object.keys(LAYOUT_LABEL) as KeyboardLayoutId[]).map((id) => ({ id, label: LAYOUT_LABEL[id] }));
export const SWITCH_FILTERS = (Object.keys(SWITCH_TYPE_LABEL) as SwitchType[]).map((id) => ({ id, label: SWITCH_TYPE_LABEL[id] }));

export interface CatalogQuery {
  cat: CategoryFilter;
  q: string;
  layouts: KeyboardLayoutId[];
  switches: SwitchType[];
  price: PriceRangeId | null;
  stock: boolean;
  sort: SortId;
}

export const EMPTY_QUERY: CatalogQuery = {
  cat: "todos",
  q: "",
  layouts: [],
  switches: [],
  price: null,
  stock: false,
  sort: "destaques",
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | null =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : null;

const listOf = <T extends string>(value: string | null, allowed: readonly T[]): T[] =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is T => (allowed as readonly string[]).includes(v));

interface ParamsLike {
  get(name: string): string | null;
}

export function parseQuery(params: ParamsLike): CatalogQuery {
  return {
    cat: oneOf(params.get("cat"), CATEGORY_FILTERS.map((c) => c.id)) ?? "todos",
    q: (params.get("q") ?? "").slice(0, 80),
    layouts: listOf(params.get("layout"), LAYOUT_FILTERS.map((l) => l.id)),
    switches: listOf(params.get("switch"), SWITCH_FILTERS.map((s) => s.id)),
    price: oneOf(params.get("preco"), PRICE_RANGES.map((p) => p.id)),
    stock: params.get("estoque") === "1",
    sort: oneOf(params.get("ordem"), SORTS.map((s) => s.id)) ?? "destaques",
  };
}

export function toQueryString(q: CatalogQuery): string {
  const p = new URLSearchParams();
  if (q.cat !== "todos") p.set("cat", q.cat);
  if (q.q.trim()) p.set("q", q.q.trim());
  if (q.layouts.length) p.set("layout", q.layouts.join(","));
  if (q.switches.length) p.set("switch", q.switches.join(","));
  if (q.price) p.set("preco", q.price);
  if (q.stock) p.set("estoque", "1");
  if (q.sort !== "destaques") p.set("ordem", q.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function hasFilters(q: CatalogQuery): boolean {
  return Boolean(q.q.trim() || q.layouts.length || q.switches.length || q.price || q.stock || q.cat !== "todos");
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function haystack(p: Product): string {
  return normalize(
    [
      p.name,
      p.tagline,
      CATEGORY_LABEL[p.category],
      p.layout ? LAYOUT_LABEL[p.layout] : "",
      p.switchType ? SWITCH_TYPE_LABEL[p.switchType] : "",
      p.model.kind === "keycaps" ? `keycaps ${p.model.colorway}` : "",
      ...p.specs.map((s) => s.value),
    ].join(" "),
  );
}

function offersSwitch(p: Product, type: SwitchType): boolean {
  if (p.switchType) return p.switchType === type;
  const byId: Record<string, SwitchType> = { creme: "linear", degrau: "tatil", estalo: "clicky" };
  return Boolean(p.options.switches?.some((s) => !s.soldOut && byId[s.id] === type));
}

const inStock = (p: Product) => p.status.kind === "in-stock" || p.status.kind === "low-stock";

export function filterProducts(products: Product[], q: CatalogQuery, ignoreCategory = false): Product[] {
  const tokens = normalize(q.q).split(/\s+/).filter(Boolean);
  const range = PRICE_RANGES.find((r) => r.id === q.price);
  const out = products.filter((p) => {
    if (!ignoreCategory && q.cat !== "todos" && p.category !== q.cat) return false;
    if (q.layouts.length && (!p.layout || !q.layouts.includes(p.layout))) return false;
    if (q.switches.length && !q.switches.some((t) => offersSwitch(p, t))) return false;
    if (range && (p.price < range.min || p.price >= range.max)) return false;
    if (q.stock && !inStock(p)) return false;
    if (tokens.length) {
      const h = haystack(p);
      if (!tokens.every((t) => h.includes(t))) return false;
    }
    return true;
  });
  const order = new Map(products.map((p, i) => [p.id, i]));
  const featuredRank = (p: Product) => (p.featured ? 0 : 1);
  switch (q.sort) {
    case "menor-preco":
      return out.sort((a, b) => a.price - b.price);
    case "maior-preco":
      return out.sort((a, b) => b.price - a.price);
    case "novidades":
      return out.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    default:
      return out.sort((a, b) => featuredRank(a) - featuredRank(b) || order.get(a.id)! - order.get(b.id)!);
  }
}
