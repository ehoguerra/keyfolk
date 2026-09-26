"use client";

import { Icon } from "./Icon";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, label, size = "md" }: QuantityStepperProps) {
  const h = size === "sm" ? "h-10" : "h-12";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex ${h} items-stretch overflow-hidden rounded-[12px] border border-line bg-surface shadow-[inset_0_-3px_0_var(--wash)]`}
    >
      <button
        type="button"
        className={`${w} grid place-items-center transition-colors hover:bg-wash disabled:opacity-40`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <Icon name="minus" size={18} />
      </button>
      <output
        aria-live="polite"
        aria-label={`Quantidade: ${value}`}
        className="price ui grid min-w-8 place-items-center px-1 text-base"
      >
        {value}
      </output>
      <button
        type="button"
        className={`${w} grid place-items-center transition-colors hover:bg-wash disabled:opacity-40`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
