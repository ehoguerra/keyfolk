"use client";

import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useHydrated } from "@/lib/useHydrated";
import { Icon } from "../ui/Icon";

export function CartButton() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const hydrated = useHydrated(useCart);
  const openCart = useUi((s) => s.openCart);
  const shown = hydrated ? count : 0;
  return (
    <button
      type="button"
      className="icon-btn relative"
      onClick={openCart}
      aria-haspopup="dialog"
      aria-controls="cart-drawer"
      aria-label={shown ? `Carrinho, ${shown} ${shown === 1 ? "item" : "itens"}` : "Carrinho vazio"}
      data-testid="cart-button"
    >
      <Icon name="bag" />
      {shown > 0 ? (
        <span
          data-testid="cart-count"
          className="price ui absolute -right-0.5 -top-0.5 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-brand px-1 text-[11px] leading-none text-on-brand shadow-[0_0_0_2px_var(--bg)]"
        >
          {shown}
        </span>
      ) : null}
    </button>
  );
}
