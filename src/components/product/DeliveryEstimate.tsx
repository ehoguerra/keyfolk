"use client";

import { useId, useState } from "react";
import { formatShortDate } from "@/lib/format";
import { cepDigits, estimateDelivery, formatCep, type DeliveryEstimate as Estimate } from "@/lib/shipping";
import { Icon } from "../ui/Icon";

export function DeliveryEstimate({ freeShipping }: { freeShipping: boolean }) {
  const id = useId();
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<Estimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const digits = cepDigits(cep);
    if (digits.length !== 8) {
      setResult(null);
      setError("Digite os 8 números do CEP, por exemplo 01310-100.");
      return;
    }
    const estimate = estimateDelivery(digits);
    if (!estimate) {
      setResult(null);
      setError("Esse CEP não parece existir. Confira os números e tente de novo.");
      return;
    }
    setError(null);
    setResult(estimate);
  };

  return (
    <div className="rounded-[18px] border border-line p-4">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          calculate();
        }}
      >
        <label htmlFor={id} className="field-label flex items-center gap-2">
          <Icon name="truck" size={18} className="text-muted" />
          Calcular prazo de entrega
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            inputMode="numeric"
            autoComplete="postal-code"
            className="input"
            placeholder="00000-000"
            value={cep}
            maxLength={9}
            onChange={(e) => {
              setCep(formatCep(e.target.value));
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : `${id}-help`}
            data-testid="delivery-cep"
          />
          <button type="submit" className="btn shrink-0">
            Calcular
          </button>
        </div>
      </form>
      {error ? (
        <p id={`${id}-err`} className="field-error" role="alert">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
      <div aria-live="polite">
        {result ? (
          <dl className="mt-4 grid gap-2 text-[0.9375rem]" data-testid="delivery-result">
            <div className="flex justify-between gap-3">
              <dt>
                PAC <span className="text-muted">({result.region})</span>
              </dt>
              <dd className="price text-right">
                {formatShortDate(result.pac[0])} a {formatShortDate(result.pac[1])}
                {freeShipping ? <span className="ui block text-xs">grátis</span> : null}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>SEDEX</dt>
              <dd className="price text-right">
                {formatShortDate(result.sedex[0])} a {formatShortDate(result.sedex[1])}
              </dd>
            </div>
          </dl>
        ) : (
          <p id={`${id}-help`} className="mt-2 text-xs text-muted">
            Enviamos de São Paulo em até 1 dia útil. Frete grátis acima de R$ 999.
          </p>
        )}
      </div>
    </div>
  );
}
