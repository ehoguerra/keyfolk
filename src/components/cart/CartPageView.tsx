"use client";

import Link from "next/link";
import { pluralize } from "@/lib/format";
import { EmptyKeys } from "../ui/EmptyKeys";
import { Icon } from "../ui/Icon";
import { CartLines } from "./CartLines";
import { CartSummary } from "./CartSummary";
import { CouponField } from "./CouponField";
import { FreeShippingBar } from "./FreeShippingBar";
import { useCartView } from "./useCartView";

export function CartPageView() {
  const { resolved, totals, coupon, hydrated } = useCartView();

  if (!hydrated) return <div className="h-[50vh]" aria-busy="true" />;

  if (!resolved.length) {
    return (
      <div className="flex flex-col items-start gap-5 py-6">
        <EmptyKeys />
        <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Seu carrinho está vazio</h1>
        <p className="max-w-[46ch] text-lg text-muted">
          Que tal começar pelo Folk 75? Ou escolha um colorway de keycaps para renovar o teclado que você já tem.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/produto/folk-75" className="btn btn-primary btn-lg">
            Conhecer o Folk 75
          </Link>
          <Link href="/loja" className="btn btn-lg">
            Ver a loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Carrinho</h1>
        <p className="mt-3 text-muted">{pluralize(totals.count, "item", "itens")} esperando por você.</p>
        <div className="mt-8 border-y border-line">
          <CartLines lines={resolved} size="full" />
        </div>
        <Link href="/loja" className="ui mt-6 inline-flex items-center gap-2 rounded-lg px-1 py-2 text-[0.9375rem] hover:underline">
          <Icon name="arrow-left" size={18} /> Continuar comprando
        </Link>
      </div>
      <aside className="lg:col-span-5" aria-labelledby="resumo-carrinho">
        <div className="flex flex-col gap-6 rounded-[28px] bg-surface p-6 lg:sticky lg:top-24 md:p-8">
          <h2 id="resumo-carrinho" className="display text-2xl">
            Resumo
          </h2>
          <FreeShippingBar totals={totals} />
          <CouponField applied={coupon} />
          <CartSummary totals={totals} coupon={coupon} />
          <Link href="/checkout" className="btn btn-primary btn-lg w-full">
            <Icon name="lock" size={18} />
            Finalizar compra
          </Link>
          <p className="text-center text-sm text-muted">Pix com 5% de desconto ou até 10x sem juros no cartão.</p>
        </div>
      </aside>
    </div>
  );
}
