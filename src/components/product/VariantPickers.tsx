"use client";

import type { Product } from "@/data/products";
import { formatBRL } from "@/lib/format";
import type { Selection } from "@/lib/variants";

interface PickersProps {
  product: Product;
  selection: Selection;
  onChange: (patch: Partial<Selection>) => void;
}

function delta(value: number) {
  if (value === 0) return null;
  return `${value > 0 ? "+" : "−"}${formatBRL(Math.abs(value))}`;
}

export function VariantPickers({ product, selection, onChange }: PickersProps) {
  const { cases, switches, packs } = product.options;
  const currentCase = cases?.find((c) => c.id === selection.case);
  return (
    <div className="flex flex-col gap-6">
      {cases?.length ? (
        <fieldset>
          <legend className="ui mb-3 text-sm">
            Cor do case: <span className="font-normal text-muted">{currentCase?.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {cases.map((c) => (
              <label key={c.id} className="chip pl-2" title={c.name} data-testid={`case-${c.id}`}>
                <input
                  type="radio"
                  name="case"
                  className="sr-only"
                  value={c.id}
                  checked={selection.case === c.id}
                  onChange={() => onChange({ case: c.id })}
                />
                <span
                  aria-hidden="true"
                  className="size-6 rounded-[7px] shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),inset_0_1px_0_rgb(255_255_255/0.35)] ring-1 ring-black/10"
                  style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${c.hex} 80%, white), ${c.hex} 55%, color-mix(in oklab, ${c.hex} 85%, black))` }}
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {switches?.length ? (
        <fieldset>
          <legend className="ui mb-3 text-sm">Switch</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {switches.map((s) => (
              <label
                key={s.id}
                className="chip h-auto min-h-[60px] flex-col items-start justify-center gap-0 py-2 leading-tight"
                data-testid={`switch-${s.id}`}
              >
                <input
                  type="radio"
                  name="switch"
                  className="sr-only"
                  value={s.id}
                  checked={selection.switch === s.id}
                  disabled={s.soldOut}
                  onChange={() => onChange({ switch: s.id })}
                />
                <span>{s.name}</span>
                <span className="text-xs font-normal opacity-75">
                  {s.soldOut ? "esgotado" : s.detail}
                  {!s.soldOut && delta(s.priceDelta) ? `, ${delta(s.priceDelta)}` : ""}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {packs?.length ? (
        <fieldset>
          <legend className="ui mb-3 text-sm">Quantidade no pack</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {packs.map((p) => (
              <label
                key={p.id}
                className="chip h-auto min-h-[60px] flex-col items-start justify-center gap-0 py-2 leading-tight"
                data-testid={`pack-${p.id}`}
              >
                <input
                  type="radio"
                  name="pack"
                  className="sr-only"
                  value={p.id}
                  checked={selection.pack === p.id}
                  onChange={() => onChange({ pack: p.id })}
                />
                <span>{p.name}</span>
                <span className="price text-xs font-normal opacity-75">{formatBRL(p.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
