"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { orderTotal, shippingOptions, type PaymentId, type ShippingId } from "@/lib/cart";
import { formatBRL, pluralize } from "@/lib/format";
import { createOrderNumber, saveOrder } from "@/lib/order";
import {
  EMAIL_RE,
  isValidCpf,
  isValidLuhn,
  maskCard,
  maskCpf,
  maskExpiry,
  maskPhone,
  onlyDigits,
  UFS,
} from "@/lib/validation";
import { formatCep } from "@/lib/shipping";
import { useCart } from "@/store/cart";
import { CouponField } from "../cart/CouponField";
import { EmptyKeys } from "../ui/EmptyKeys";
import { useCartView } from "../cart/useCartView";
import { Icon } from "../ui/Icon";
import { TextField } from "./TextField";

type Values = {
  email: string;
  name: string;
  phone: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  email: "",
  name: "",
  phone: "",
  cpf: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  uf: "",
  cardNumber: "",
  cardName: "",
  cardExpiry: "",
  cardCvv: "",
  installments: "1",
};

const ORDER: Array<keyof Values> = [
  "email",
  "name",
  "phone",
  "cpf",
  "cep",
  "street",
  "number",
  "district",
  "city",
  "uf",
  "cardNumber",
  "cardName",
  "cardExpiry",
  "cardCvv",
];

function validate(v: Values, payment: PaymentId): Errors {
  const e: Errors = {};
  if (!v.email.trim()) e.email = "Digite seu e-mail para receber a confirmação.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Esse e-mail parece incompleto. Use o formato nome@email.com.";
  if (v.name.trim().split(/\s+/).length < 2) e.name = "Digite nome e sobrenome, como no documento.";
  const phone = onlyDigits(v.phone);
  if (phone.length < 10) e.phone = "Digite o celular com DDD, por exemplo (11) 91234-5678.";
  if (!isValidCpf(v.cpf)) e.cpf = "CPF inválido. Confira os 11 números.";
  if (onlyDigits(v.cep).length !== 8) e.cep = "Digite os 8 números do CEP.";
  if (!v.street.trim()) e.street = "Digite a rua ou avenida.";
  if (!v.number.trim()) e.number = "Digite o número (ou “s/n”).";
  if (!v.district.trim()) e.district = "Digite o bairro.";
  if (!v.city.trim()) e.city = "Digite a cidade.";
  if (!UFS.includes(v.uf)) e.uf = "Escolha o estado.";
  if (payment === "cartao") {
    if (!isValidLuhn(v.cardNumber)) e.cardNumber = "Número de cartão inválido. Confira os dígitos.";
    if (v.cardName.trim().length < 3) e.cardName = "Digite o nome como está impresso no cartão.";
    const [mm, yy] = v.cardExpiry.split("/").map(Number);
    const now = new Date();
    const exp = new Date(2000 + (yy || 0), mm || 0, 1);
    if (!mm || mm > 12 || !yy || exp <= now) e.cardExpiry = "Validade inválida ou vencida. Use MM/AA.";
    if (!/^\d{3,4}$/.test(v.cardCvv)) e.cardCvv = "O código tem 3 ou 4 números, no verso do cartão.";
  }
  return e;
}

type CepState = { status: "idle" | "loading" | "ok" } | { status: "error"; message: string };

export function CheckoutForm() {
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const { resolved, totals, coupon, hydrated } = useCartView();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [shipping, setShipping] = useState<ShippingId>("pac");
  const [payment, setPayment] = useState<PaymentId>("pix");
  const [cep, setCep] = useState<CepState>({ status: "idle" });
  const [placing, setPlacing] = useState(false);
  const lastCep = useRef("");
  const formRef = useRef<HTMLFormElement>(null);

  const options = shippingOptions(totals.freeShipping);
  const ship = options.find((o) => o.id === shipping)!;
  const { pixDiscount, total } = orderTotal(totals, ship.price, payment);

  const set = (key: keyof Values, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) setErrors(validate(next, payment));
  };

  const lookupCep = async (digits: string) => {
    if (digits === lastCep.current) return;
    lastCep.current = digits;
    setCep({ status: "loading" });
    try {
      const ctrl = new AbortController();
      const timeout = window.setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: ctrl.signal });
      window.clearTimeout(timeout);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
      if (data.erro) {
        setCep({ status: "error", message: "Não encontramos esse CEP. Confira os números ou preencha o endereço à mão." });
        return;
      }
      setValues((v) => ({
        ...v,
        street: data.logradouro || v.street,
        district: data.bairro || v.district,
        city: data.localidade || v.city,
        uf: data.uf || v.uf,
      }));
      setCep({ status: "ok" });
      window.setTimeout(() => document.getElementById("f-number")?.focus(), 30);
    } catch {
      setCep({
        status: "error",
        message: "Não conseguimos consultar o CEP agora (sem conexão?). Preencha o endereço à mão, está tudo certo.",
      });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(values, payment);
    setErrors(errs);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setPlacing(true);
    const number = createOrderNumber();
    saveOrder({
      number,
      total,
      payment,
      shipping,
      name: values.name.trim().split(/\s+/)[0],
      email: values.email.trim(),
      items: totals.count,
      city: `${values.city} (${values.uf})`,
      createdAt: new Date().toISOString(),
    });
    clear();
    router.push("/checkout/sucesso");
  };

  if (!hydrated) {
    return <div className="h-[60vh]" aria-busy="true" />;
  }

  if (!resolved.length && !placing) {
    return (
      <div className="flex flex-col items-start gap-5 py-10">
        <EmptyKeys />
        <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">Seu carrinho está vazio</h1>
        <p className="max-w-[46ch] text-muted">Escolha um teclado, keycaps ou switches e volte aqui para finalizar. O caminho é curto.</p>
        <Link href="/loja" className="btn btn-primary btn-lg">
          Ir para a loja
        </Link>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12" data-testid="checkout-form">
      <div className="flex flex-col gap-12 lg:col-span-7">
        <div>
          <h1 className="display text-[clamp(2.5rem,5vw,4rem)]">Checkout</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Icon name="lock" size={16} />
            Demonstração: nenhum dado sai do seu navegador e nada é cobrado.
          </p>
          {submitted && errorCount > 0 ? (
            <p role="alert" className="field-error mt-4 rounded-[12px] border border-current/30 px-4 py-3">
              <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
              {errorCount === 1 ? "Falta corrigir 1 campo" : `Faltam corrigir ${errorCount} campos`} antes de finalizar. O primeiro já está
              selecionado.
            </p>
          ) : null}
        </div>

        <Section step={1} title="Contato">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
              className="sm:col-span-2"
            />
            <TextField
              name="name"
              label="Nome completo"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              className="sm:col-span-2"
            />
            <TextField
              name="phone"
              label="Celular"
              type="tel"
              autoComplete="tel-national"
              inputMode="numeric"
              placeholder="(11) 91234-5678"
              value={values.phone}
              onChange={(e) => set("phone", maskPhone(e.target.value))}
              error={errors.phone}
            />
            <TextField
              name="cpf"
              label="CPF"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={values.cpf}
              onChange={(e) => set("cpf", maskCpf(e.target.value))}
              error={errors.cpf}
              hint="Obrigatório para emitir a nota fiscal."
            />
          </div>
        </Section>

        <Section step={2} title="Endereço de entrega">
          <div className="grid grid-cols-6 gap-4">
            <TextField
              name="cep"
              label="CEP"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              maxLength={9}
              value={values.cep}
              onChange={(e) => {
                const masked = formatCep(e.target.value);
                set("cep", masked);
                const digits = onlyDigits(masked);
                if (digits.length === 8) void lookupCep(digits);
                else if (cep.status !== "idle") {
                  lastCep.current = "";
                  setCep({ status: "idle" });
                }
              }}
              error={errors.cep}
              className="col-span-6 sm:col-span-3"
              data-testid="checkout-cep"
            />
            <div className="col-span-6 flex items-end pb-3 sm:col-span-3" aria-live="polite">
              {cep.status === "loading" ? (
                <p className="text-sm text-muted">Buscando endereço…</p>
              ) : cep.status === "ok" ? (
                <p className="ui flex items-center gap-1.5 text-sm">
                  <Icon name="check" size={16} /> Endereço encontrado
                </p>
              ) : cep.status === "error" ? (
                <p className="text-sm text-muted" data-testid="cep-error">
                  {cep.message}
                </p>
              ) : (
                <a
                  className="link text-sm text-muted"
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noreferrer"
                >
                  Não sei meu CEP
                </a>
              )}
            </div>
            <TextField
              name="street"
              label="Rua ou avenida"
              autoComplete="address-line1"
              value={values.street}
              onChange={(e) => set("street", e.target.value)}
              error={errors.street}
              className="col-span-6 sm:col-span-4"
            />
            <TextField
              name="number"
              label="Número"
              value={values.number}
              onChange={(e) => set("number", e.target.value)}
              error={errors.number}
              className="col-span-3 sm:col-span-2"
            />
            <TextField
              name="complement"
              label="Complemento"
              optional
              autoComplete="address-line2"
              value={values.complement}
              onChange={(e) => set("complement", e.target.value)}
              className="col-span-3 sm:col-span-2"
            />
            <TextField
              name="district"
              label="Bairro"
              value={values.district}
              onChange={(e) => set("district", e.target.value)}
              error={errors.district}
              className="col-span-6 sm:col-span-4"
            />
            <TextField
              name="city"
              label="Cidade"
              autoComplete="address-level2"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              error={errors.city}
              className="col-span-4"
            />
            <div className="col-span-2">
              <label htmlFor="f-uf" className="field-label">
                UF
              </label>
              <select
                id="f-uf"
                name="uf"
                className="input"
                autoComplete="address-level1"
                value={values.uf}
                onChange={(e) => set("uf", e.target.value)}
                aria-invalid={errors.uf ? true : undefined}
                aria-describedby={errors.uf ? "f-uf-error" : undefined}
              >
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              {errors.uf ? (
                <p id="f-uf-error" className="field-error">
                  <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                  {errors.uf}
                </p>
              ) : null}
            </div>
          </div>
        </Section>

        <Section step={3} title="Entrega">
          <div role="radiogroup" aria-label="Opção de entrega" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((o) => (
              <label key={o.id} className="choice" data-testid={`shipping-${o.id}`}>
                <input
                  type="radio"
                  name="shipping"
                  value={o.id}
                  checked={shipping === o.id}
                  onChange={() => setShipping(o.id)}
                  className="sr-only"
                />
                <span className="flex w-full items-start justify-between gap-3">
                  <span>
                    <span className="ui block">{o.name}</span>
                    <span className="text-sm text-muted">
                      {o.days[0]} a {o.days[1]} dias úteis
                    </span>
                  </span>
                  <span className="price ui">{o.price === 0 ? "Grátis" : formatBRL(o.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section step={4} title="Pagamento">
          <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                { id: "pix", name: "Pix", note: "5% de desconto" },
                { id: "cartao", name: "Cartão", note: "até 10x sem juros" },
                { id: "boleto", name: "Boleto", note: "vence em 3 dias" },
              ] as const
            ).map((p) => (
              <label key={p.id} className="choice" data-testid={`payment-${p.id}`}>
                <input
                  type="radio"
                  name="payment"
                  value={p.id}
                  checked={payment === p.id}
                  onChange={() => {
                    setPayment(p.id);
                    if (submitted) setErrors(validate(values, p.id));
                  }}
                  className="sr-only"
                />
                <span>
                  <span className="ui block">{p.name}</span>
                  <span className="text-sm text-muted">{p.note}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-[18px] bg-surface p-5">
            {payment === "pix" ? (
              <p className="text-[0.9375rem]">
                O QR code aparece na próxima tela, junto com o código copia e cola. Você economiza{" "}
                <strong className="price">{formatBRL(pixDiscount)}</strong>.
              </p>
            ) : payment === "boleto" ? (
              <p className="text-[0.9375rem]">
                O boleto vence em 3 dias úteis. Reservamos os produtos até a compensação, que leva até 2 dias úteis.
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-4">
                <TextField
                  name="cardNumber"
                  label="Número do cartão"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0000 0000 0000 0000"
                  value={values.cardNumber}
                  onChange={(e) => set("cardNumber", maskCard(e.target.value))}
                  error={errors.cardNumber}
                  className="col-span-6"
                />
                <TextField
                  name="cardName"
                  label="Nome impresso no cartão"
                  autoComplete="off"
                  value={values.cardName}
                  onChange={(e) => set("cardName", e.target.value.toUpperCase())}
                  error={errors.cardName}
                  className="col-span-6"
                />
                <TextField
                  name="cardExpiry"
                  label="Validade"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/AA"
                  value={values.cardExpiry}
                  onChange={(e) => set("cardExpiry", maskExpiry(e.target.value))}
                  error={errors.cardExpiry}
                  className="col-span-3"
                />
                <TextField
                  name="cardCvv"
                  label="CVV"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={values.cardCvv}
                  onChange={(e) => set("cardCvv", onlyDigits(e.target.value).slice(0, 4))}
                  error={errors.cardCvv}
                  className="col-span-3"
                />
                <div className="col-span-6">
                  <label htmlFor="f-installments" className="field-label">
                    Parcelas
                  </label>
                  <select
                    id="f-installments"
                    className="input"
                    value={values.installments}
                    onChange={(e) => set("installments", e.target.value)}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(Math.round((total / n) * 100) / 100)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
                <p className="col-span-6 flex items-start gap-2 text-sm text-muted">
                  <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
                  Demonstração: os dados do cartão nunca são enviados nem guardados. Para testar, use 4242 4242 4242 4242.
                </p>
              </div>
            )}
          </div>
        </Section>
      </div>

      <aside className="lg:col-span-5" aria-labelledby="resumo">
        <div className="flex flex-col gap-5 rounded-[28px] bg-surface p-6 lg:sticky lg:top-24 md:p-7">
          <h2 id="resumo" className="display text-2xl">
            Resumo <span className="ui text-base text-muted">{pluralize(totals.count, "item", "itens")}</span>
          </h2>
          <ul className="flex flex-col gap-4">
            {resolved.map((r) => (
              <li key={r.line.key} className="flex items-center gap-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px] bg-bg">
                  <Image src={r.image} alt={r.product.alt} fill sizes="64px" className="object-contain p-1" />
                  <span className="price ui absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-bg">
                    {r.line.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="ui block truncate">{r.product.name}</span>
                  {r.label ? <span className="block truncate text-sm text-muted">{r.label}</span> : null}
                </span>
                <span className="price ui shrink-0">{formatBRL(r.total)}</span>
              </li>
            ))}
          </ul>
          <CouponField applied={coupon} />
          <dl className="flex flex-col gap-2 border-t border-line pt-4 text-[0.9375rem]">
            <Row label="Subtotal" value={formatBRL(totals.subtotal)} />
            {totals.discount > 0 ? <Row label={`Cupom ${coupon}`} value={`−${formatBRL(totals.discount)}`} /> : null}
            {pixDiscount > 0 ? <Row label="Desconto Pix (5%)" value={`−${formatBRL(pixDiscount)}`} /> : null}
            <Row label={`Frete (${ship.name})`} value={ship.price === 0 ? "Grátis" : formatBRL(ship.price)} />
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <dt className="ui text-lg">Total</dt>
              <dd className="price ui text-2xl" data-testid="checkout-total">
                {formatBRL(total)}
              </dd>
            </div>
          </dl>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={placing} data-testid="place-order">
            <Icon name="lock" size={18} />
            {payment === "pix" ? "Finalizar e gerar Pix" : payment === "boleto" ? "Finalizar e gerar boleto" : "Finalizar pagamento"}
          </button>
          <p className="text-center text-xs text-muted">Ao finalizar, você concorda com os termos de uma loja que só existe no portfólio.</p>
        </div>
      </aside>
    </form>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="ui grid size-9 place-items-center rounded-[10px] bg-alpha text-alpha-legend shadow-[inset_0_-4px_0_rgb(0_0_0/0.12)] ring-1 ring-line"
        >
          {step}
        </span>
        <span className="display text-[1.75rem]">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="price">{value}</dd>
    </div>
  );
}
