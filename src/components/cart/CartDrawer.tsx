"use client";

import Link from "next/link";
import { useId } from "react";
import { pluralize } from "@/lib/format";
import { useUi } from "@/store/ui";
import { Icon } from "../ui/Icon";
import { EmptyKeys } from "../ui/EmptyKeys";
import { Sheet } from "../ui/Sheet";
import { CartLines } from "./CartLines";
import { CartSummary } from "./CartSummary";
import { CouponField } from "./CouponField";
import { FreeShippingBar } from "./FreeShippingBar";
import { useCartView } from "./useCartView";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const close = useUi((s) => s.closeCart);
  const titleId = useId();
  const { resolved, totals, coupon } = useCartView();
  const empty = resolved.length === 0;

  return (
    <Sheet open={open} onClose={close} labelledBy={titleId} id="cart-drawer">
      <div className="flex h-full flex-col" data-testid="cart-drawer">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="display text-2xl">
            Seu carrinho
            {!empty ? <span className="ui ml-2 align-middle text-base text-muted">{pluralize(totals.count, "item", "itens")}</span> : null}
          </h2>
          <button type="button" className="icon-btn -mr-2" onClick={close} aria-label="Fechar carrinho">
            <Icon name="close" />
          </button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6 pb-16">
            <EmptyKeys />
            <div>
              <p className="display text-3xl">Nada por aqui ainda.</p>
              <p className="mt-2 max-w-[32ch] text-muted">
                Seu próximo teclado favorito está a um clique. Comece pelo Folk 75, o queridinho da casa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/produto/folk-75" className="btn btn-primary" onClick={close}>
                Conhecer o Folk 75
              </Link>
              <Link href="/loja" className="btn" onClick={close}>
                Ver a loja
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-4">
              <FreeShippingBar totals={totals} />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5">
              <CartLines lines={resolved} onNavigate={close} />
            </div>
            <div className="flex flex-col gap-4 border-t border-line bg-surface-2 px-5 pb-5 pt-4">
              <CouponField applied={coupon} />
              <CartSummary totals={totals} coupon={coupon} />
              <div className="flex flex-col gap-2">
                <Link href="/checkout" className="btn btn-primary btn-lg w-full" onClick={close}>
                  <Icon name="lock" size={18} />
                  Finalizar compra
                </Link>
                <Link href="/carrinho" className="ui self-center rounded-lg px-3 py-2 text-sm underline underline-offset-4 hover:bg-wash" onClick={close}>
                  Ver carrinho completo
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
