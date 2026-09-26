"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { formatBRL, formatDayMonth } from "@/lib/format";
import { readOrderRaw, type PlacedOrder } from "@/lib/order";
import { addBusinessDays } from "@/lib/shipping";
import { Icon } from "../ui/Icon";
import { EmptyKeys } from "../ui/EmptyKeys";
import { PixQr } from "./PixQr";

const subscribe = () => () => {};

export function OrderSuccess() {
  const raw = useSyncExternalStore(subscribe, readOrderRaw, () => undefined);
  const [copied, setCopied] = useState(false);

  if (raw === undefined) return <div className="h-[60vh]" aria-busy="true" />;

  const order = raw ? (JSON.parse(raw) as PlacedOrder) : null;
  if (!order) {
    return (
      <div className="flex flex-col items-start gap-5 py-10">
        <EmptyKeys />
        <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">Nenhum pedido recente por aqui</h1>
        <p className="max-w-[46ch] text-muted">
          A confirmação fica guardada só nesta aba. Se você fechou a janela, tudo bem: nada foi cobrado de verdade.
        </p>
        <Link href="/loja" className="btn btn-primary btn-lg">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136keyfolk-demo-${order.number.toLowerCase()}5204000053039865406${order.total.toFixed(2)}5802BR5907KEYFOLK6009SAO PAULO`;
  const created = new Date(order.createdAt);
  const eta = addBusinessDays(created, order.shipping === "sedex" ? 4 : 9);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12" data-testid="order-success">
      <div className="flex flex-col gap-6 lg:col-span-7">
        <p className="ui inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm text-accent-legend">
          <Icon name="check" size={16} strokeWidth={2.4} /> Pedido recebido
        </p>
        <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Valeu, {order.name}! Seu teclado já tem dono.</h1>
        <p className="text-lg text-muted">
          Número do pedido{" "}
          <strong className="ui price text-ink" data-testid="order-number">
            {order.number}
          </strong>
          . Mandamos a confirmação para {order.email}.
        </p>
        <dl className="grid grid-cols-2 gap-4 rounded-[22px] border border-line p-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Total</dt>
            <dd className="price ui text-xl">{formatBRL(order.total)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Itens</dt>
            <dd className="ui text-xl">{order.items}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-muted">Previsão de entrega</dt>
            <dd className="ui text-xl">até {formatDayMonth(eta)}</dd>
          </div>
        </dl>
        <ol className="flex flex-col gap-3 text-[0.9375rem]">
          <li className="flex gap-3">
            <span className="ui grid size-7 shrink-0 place-items-center rounded-[8px] bg-alpha text-sm text-alpha-legend ring-1 ring-line">1</span>
            {order.payment === "pix"
              ? "Pague o Pix em até 30 minutos para garantir o lote."
              : order.payment === "boleto"
                ? "Pague o boleto em até 3 dias úteis."
                : "O pagamento no cartão foi aprovado (de mentirinha)."}
          </li>
          <li className="flex gap-3">
            <span className="ui grid size-7 shrink-0 place-items-center rounded-[8px] bg-alpha text-sm text-alpha-legend ring-1 ring-line">2</span>
            Montamos e testamos tecla por tecla em até 1 dia útil.
          </li>
          <li className="flex gap-3">
            <span className="ui grid size-7 shrink-0 place-items-center rounded-[8px] bg-alpha text-sm text-alpha-legend ring-1 ring-line">3</span>
            Você recebe o código de rastreio por e-mail e segue a entrega até {order.city}.
          </li>
        </ol>
        <div className="flex flex-wrap gap-3">
          <Link href="/loja" className="btn btn-primary btn-lg">
            Continuar comprando
          </Link>
          <Link href="/" className="btn btn-lg">
            Voltar ao início
          </Link>
        </div>
      </div>

      {order.payment === "pix" ? (
        <aside className="lg:col-span-5" aria-labelledby="pix-title">
          <div className="flex flex-col gap-5 rounded-[28px] bg-surface p-6 md:p-8">
            <h2 id="pix-title" className="display text-2xl">
              Pague com Pix
            </h2>
            <div className="mx-auto w-full max-w-[280px] rounded-[20px] bg-white p-3 text-[#111] shadow-[0_18px_40px_-24px_var(--shadow-color)]">
              <PixQr seed={order.number} />
            </div>
            <p className="text-center text-sm text-muted">QR ilustrativo: é uma demonstração, não tente pagar.</p>
            <div>
              <label htmlFor="pix-code" className="field-label">
                Pix copia e cola
              </label>
              <div className="flex gap-2">
                <input id="pix-code" readOnly value={pixCode} className="input truncate font-normal text-sm" onFocus={(e) => e.currentTarget.select()} />
                <button
                  type="button"
                  className="btn shrink-0"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(pixCode);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2500);
                    } catch {
                      document.getElementById("pix-code")?.focus();
                    }
                  }}
                >
                  <Icon name={copied ? "check" : "copy"} size={18} />
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {copied ? "Código Pix copiado." : ""}
              </p>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
