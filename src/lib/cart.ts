import { getProductById, type Product } from "@/data/products";
import { SITE } from "@/lib/site";
import { isPurchasable, variantImage, variantLabel, variantPrice } from "@/lib/variants";
import type { CartLine } from "@/store/cart";

export const COUPONS: Record<string, { percent: number; label: string }> = {
  FOLK10: { percent: 10, label: "10% de desconto" },
};

export type CouponResult = { ok: true; code: string; label: string } | { ok: false; message: string };

export function validateCoupon(raw: string): CouponResult {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return { ok: false, message: "Digite um cupom antes de aplicar." };
  const coupon = COUPONS[code];
  if (!coupon) {
    return {
      ok: false,
      message: `Não encontramos o cupom “${code}”. Confira a grafia, sem espaços. Dica: FOLK10 dá 10% de desconto.`,
    };
  }
  return { ok: true, code, label: coupon.label };
}

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  unitPrice: number;
  total: number;
  label: string;
  image: string;
  purchasable: boolean;
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product) continue;
    const unitPrice = variantPrice(product, line.selection);
    out.push({
      line,
      product,
      unitPrice,
      total: unitPrice * line.qty,
      label: variantLabel(product, line.selection),
      image: variantImage(product, line.selection),
      purchasable: isPurchasable(product, line.selection),
    });
  }
  return out;
}

export interface Totals {
  count: number;
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  remainingForFreeShipping: number;
  freeShipping: boolean;
  /** 0..1 progress toward free shipping. */
  progress: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function cartTotals(resolved: ResolvedLine[], coupon: string | null): Totals {
  const count = resolved.reduce((n, r) => n + r.line.qty, 0);
  const subtotal = round(resolved.reduce((n, r) => n + r.total, 0));
  const pct = coupon ? (COUPONS[coupon]?.percent ?? 0) : 0;
  const discount = round((subtotal * pct) / 100);
  const discountedSubtotal = round(subtotal - discount);
  const threshold = SITE.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, round(threshold - discountedSubtotal));
  return {
    count,
    subtotal,
    discount,
    discountedSubtotal,
    remainingForFreeShipping,
    freeShipping: count > 0 && remainingForFreeShipping === 0,
    progress: Math.min(1, discountedSubtotal / threshold),
  };
}

export type ShippingId = "pac" | "sedex";

export interface ShippingOption {
  id: ShippingId;
  name: string;
  price: number;
  days: [number, number];
}

export function shippingOptions(freeShipping: boolean): ShippingOption[] {
  return [
    { id: "pac", name: "PAC", price: freeShipping ? 0 : 29.9, days: [5, 8] },
    { id: "sedex", name: "SEDEX", price: freeShipping ? 19.9 : 49.9, days: [2, 3] },
  ];
}

export type PaymentId = "pix" | "cartao" | "boleto";

export const PIX_DISCOUNT = 0.05;

export function orderTotal(totals: Totals, shipping: number, payment: PaymentId) {
  const pix = payment === "pix" ? round(totals.discountedSubtotal * PIX_DISCOUNT) : 0;
  return { pixDiscount: pix, total: round(totals.discountedSubtotal - pix + shipping) };
}
