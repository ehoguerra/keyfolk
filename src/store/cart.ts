"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { variantKey, type Selection } from "@/lib/variants";

export interface CartLine {
  key: string;
  productId: string;
  selection: Selection;
  qty: number;
}

export const MAX_QTY = 10;

interface CartState {
  lines: CartLine[];
  coupon: string | null;
  add: (productId: string, selection: Selection, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
}

export const lineKey = (productId: string, selection: Selection) => `${productId}::${variantKey(selection)}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      add: (productId, selection, qty = 1) => {
        const key = lineKey(productId, selection);
        const existing = get().lines.find((l) => l.key === key);
        if (existing) {
          set({
            lines: get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l)),
          });
        } else {
          set({ lines: [...get().lines, { key, productId, selection, qty: Math.min(MAX_QTY, qty) }] });
        }
      },
      setQty: (key, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((l) => l.key !== key) });
          return;
        }
        set({ lines: get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)) });
      },
      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
      clear: () => set({ lines: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    {
      name: "keyfolk-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon }),
      skipHydration: true,
    },
  ),
);
