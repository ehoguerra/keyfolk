"use client";

import { useId, useState } from "react";
import { COUPONS, validateCoupon } from "@/lib/cart";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { Icon } from "../ui/Icon";

export function CouponField({ applied }: { applied: string | null }) {
  const id = useId();
  const setCoupon = useCart((s) => s.setCoupon);
  const announce = useUi((s) => s.announce);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[12px] border border-dashed border-line-strong px-3 py-2.5" data-testid="coupon-applied">
        <span className="flex items-center gap-2 text-sm">
          <Icon name="tag" size={18} className="text-muted" />
          <span>
            Cupom <strong className="ui">{applied}</strong> aplicado: {COUPONS[applied]?.label ?? "desconto"}.
          </span>
        </span>
        <button
          type="button"
          className="ui rounded-lg px-2 py-1 text-sm underline underline-offset-4 hover:bg-wash"
          onClick={() => {
            setCoupon(null);
            announce("Cupom removido.");
          }}
        >
          Remover
        </button>
      </div>
    );
  }

  const errorId = `${id}-error`;
  const apply = () => {
    const result = validateCoupon(value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setValue("");
    setCoupon(result.code);
    announce(`Cupom ${result.code} aplicado: ${result.label}.`);
  };
  // Not a <form>: this field also lives inside the checkout form.
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="field-label">
        Cupom de desconto
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="coupon"
          className="input uppercase placeholder:normal-case"
          placeholder="Ex.: FOLK10"
          value={value}
          autoComplete="off"
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="button" className="btn shrink-0" onClick={apply}>
          Aplicar
        </button>
      </div>
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
