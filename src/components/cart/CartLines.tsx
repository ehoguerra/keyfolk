"use client";

import Image from "next/image";
import Link from "next/link";
import type { ResolvedLine } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { MAX_QTY, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { Icon } from "../ui/Icon";
import { QuantityStepper } from "../ui/QuantityStepper";

interface CartLinesProps {
  lines: ResolvedLine[];
  onNavigate?: () => void;
  size?: "compact" | "full";
}

export function CartLines({ lines, onNavigate, size = "compact" }: CartLinesProps) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const announce = useUi((s) => s.announce);
  const img = size === "full" ? "size-28 md:size-32" : "size-[84px]";
  return (
    <ul className="flex flex-col divide-y divide-line" data-testid="cart-lines">
      {lines.map((r) => (
        <li key={r.line.key} className="flex gap-4 py-4" data-testid="cart-line">
          <Link
            href={`/produto/${r.product.slug}`}
            onClick={onNavigate}
            className={`${img} relative shrink-0 overflow-hidden rounded-[14px] bg-surface`}
          >
            <Image src={r.image} alt={r.product.alt} fill sizes="128px" className="object-contain p-1.5" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/produto/${r.product.slug}`} onClick={onNavigate} className="ui block truncate text-base hover:underline">
                  {r.product.name}
                </Link>
                {r.label ? <p className="text-sm text-muted">{r.label}</p> : null}
                {!r.purchasable ? <p className="text-sm font-medium text-[#b3261e]">Indisponível no momento</p> : null}
              </div>
              <p className="price ui shrink-0 text-base">{formatBRL(r.total)}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <QuantityStepper
                size="sm"
                value={r.line.qty}
                max={MAX_QTY}
                label={`Quantidade de ${r.product.name}`}
                onChange={(q) => {
                  setQty(r.line.key, q);
                  announce(`Quantidade de ${r.product.name}: ${q}.`);
                }}
              />
              <button
                type="button"
                className="ui inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-muted hover:bg-wash hover:text-ink"
                onClick={() => {
                  remove(r.line.key);
                  announce(`${r.product.name} removido do carrinho.`);
                }}
              >
                <Icon name="trash" size={17} />
                Remover
                <span className="sr-only"> {r.product.name}</span>
              </button>
            </div>
            {size === "full" && r.line.qty > 1 ? (
              <p className="price text-xs text-muted">{formatBRL(r.unitPrice)} cada</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
