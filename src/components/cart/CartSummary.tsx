import type { Totals } from "@/lib/cart";
import { formatBRL } from "@/lib/format";

export function CartSummary({ totals, coupon }: { totals: Totals; coupon: string | null }) {
  return (
    <dl className="flex flex-col gap-2 text-[0.9375rem]">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Subtotal</dt>
        <dd className="price">{formatBRL(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 ? (
        <div className="flex justify-between gap-4" data-testid="discount-row">
          <dt className="text-muted">Desconto {coupon ? `(${coupon})` : ""}</dt>
          <dd className="price">−{formatBRL(totals.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Frete</dt>
        <dd>{totals.freeShipping ? "Grátis (PAC)" : "Calculado no checkout"}</dd>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt className="ui text-base">Total</dt>
        <dd className="price ui text-xl" data-testid="cart-total">
          {formatBRL(totals.discountedSubtotal)}
        </dd>
      </div>
    </dl>
  );
}
