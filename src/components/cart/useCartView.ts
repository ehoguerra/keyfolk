"use client";

import { useMemo } from "react";
import { getProductById } from "@/data/products";
import { cartTotals, resolveLines } from "@/lib/cart";
import { useHydrated } from "@/lib/useHydrated";
import type { Selection } from "@/lib/variants";
import { variantLabel } from "@/lib/variants";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export function useCartView() {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const hydrated = useHydrated(useCart);
  const resolved = useMemo(() => resolveLines(hydrated ? lines : []), [lines, hydrated]);
  const totals = useMemo(() => cartTotals(resolved, coupon), [resolved, coupon]);
  return { resolved, totals, coupon: hydrated ? coupon : null, hydrated };
}

/** Adds a product variant, then confirms with a toast and a screen-reader announcement. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const toast = useUi((s) => s.toast);
  const announce = useUi((s) => s.announce);
  const openCart = useUi((s) => s.openCart);
  return (productId: string, selection: Selection, qty = 1) => {
    add(productId, selection, qty);
    const product = getProductById(productId);
    const count = useCart.getState().lines.reduce((n, l) => n + l.qty, 0);
    toast("Adicionado ao carrinho", { label: "Ver carrinho", onClick: openCart });
    if (product) {
      const label = variantLabel(product, selection);
      announce(
        `${qty > 1 ? `${qty} × ` : ""}${product.name}${label ? ` (${label})` : ""} adicionado ao carrinho. ${count} ${count === 1 ? "item" : "itens"} no carrinho.`,
      );
    }
  };
}
