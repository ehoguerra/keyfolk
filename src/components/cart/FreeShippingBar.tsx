import { formatBRL } from "@/lib/format";
import type { Totals } from "@/lib/cart";
import { Icon } from "../ui/Icon";

export function FreeShippingBar({ totals }: { totals: Totals }) {
  const pct = Math.round(totals.progress * 100);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm" aria-live="polite">
        <Icon name="truck" size={18} className="shrink-0 text-muted" />
        {totals.freeShipping ? (
          <span>
            <strong className="ui">Frete grátis liberado.</strong> O PAC é por nossa conta.
          </span>
        ) : (
          <span>
            Faltam <strong className="ui price">{formatBRL(totals.remainingForFreeShipping)}</strong> para o frete grátis.
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progresso até o frete grátis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-2 overflow-hidden rounded-full bg-wash shadow-[inset_0_1px_0_var(--line)]"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(pct, totals.count ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
