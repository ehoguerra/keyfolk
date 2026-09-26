"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORY_LABEL, getProduct } from "@/data/products";
import { formatBRL, installments } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import {
  defaultSelection,
  isPurchasable,
  variantImage,
  variantPrice,
  type Selection,
} from "@/lib/variants";
import { useReminders } from "@/store/favorites";
import { useUi } from "@/store/ui";
import { useAddToCart } from "../cart/useCartView";
import { Icon } from "../ui/Icon";
import { Price } from "../ui/Price";
import { QuantityStepper } from "../ui/QuantityStepper";
import { Rating } from "../ui/Rating";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { FavoriteButton } from "./FavoriteButton";
import { ProductViewer } from "./ProductViewer";
import { StatusBadge } from "./StatusBadge";
import { VariantPickers } from "./VariantPickers";

export function ProductExperience({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const router = useRouter();
  const [selection, setSelection] = useState<Selection>(() => defaultSelection(product));
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const reminders = useReminders((s) => s.ids);
  const toggleReminder = useReminders((s) => s.toggle);
  const remindersReady = useHydrated(useReminders);
  const announce = useUi((s) => s.announce);
  const toast = useUi((s) => s.toast);

  const price = variantPrice(product, selection);
  const compareAt = product.compareAtPrice ? product.compareAtPrice + (price - product.price) : undefined;
  const inst = installments(price * qty);
  const purchasable = isPurchasable(product, selection);
  const soldOut = product.status.kind === "sold-out";
  const reminded = remindersReady && reminders.includes(product.id);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-24">
          <ProductViewer product={product} caseId={selection.case} poster={variantImage(product, selection)} />
        </div>
      </div>

      <div className="flex flex-col gap-7 lg:col-span-5 lg:pt-2" data-testid="buy-box">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="ui text-sm text-muted">{CATEGORY_LABEL[product.category]}</p>
            <StatusBadge status={product.status} />
          </div>
          <h1 className="display text-[clamp(2.75rem,5vw,4.5rem)]">{product.name}</h1>
          <p className="text-lg leading-snug text-muted">{product.tagline}</p>
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className="flex flex-col gap-1" data-testid="product-price">
          <Price value={price} compareAt={compareAt} size="lg" />
          <p className="price text-sm text-muted">
            ou {inst.count}x de {formatBRL(inst.each)} sem juros, ou {formatBRL(price * qty * 0.95)} no Pix
          </p>
        </div>

        <VariantPickers
          product={product}
          selection={selection}
          onChange={(patch) => {
            setSelection((s) => ({ ...s, ...patch }) as Selection);
          }}
        />

        {soldOut ? (
          <div className="flex flex-col gap-3 rounded-[18px] bg-surface p-5">
            <p className="ui">Esgotado por enquanto.</p>
            <p className="text-sm text-muted">
              O próximo lote está a caminho. Ligue o aviso e a gente mostra um alerta aqui quando ele chegar.
            </p>
            <button
              type="button"
              className={`btn ${reminded ? "" : "btn-primary"} btn-lg`}
              aria-pressed={reminded}
              data-testid="notify-me"
              onClick={() => {
                const on = toggleReminder(product.id);
                announce(on ? "Aviso ligado. Vamos te avisar quando chegar." : "Aviso desligado.");
                if (on) toast("Aviso ligado para quando chegar");
              }}
            >
              <Icon name="bell" size={19} />
              {reminded ? "Aviso ligado: toque para desligar" : "Avise-me quando chegar"}
            </button>
            <FavoriteButton productId={product.id} productName={product.name} variant="button" className="self-start" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <QuantityStepper value={qty} onChange={setQty} label="Quantidade" />
              <button
                type="button"
                className="btn btn-primary btn-lg flex-1"
                disabled={!purchasable}
                onClick={() => addToCart(product.id, selection, qty)}
                data-testid="add-to-cart"
              >
                Adicionar ao carrinho
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-lg flex-1"
                disabled={!purchasable}
                onClick={() => {
                  addToCart(product.id, selection, qty);
                  router.push("/checkout");
                }}
                data-testid="buy-now"
              >
                Comprar agora
              </button>
              <FavoriteButton productId={product.id} productName={product.name} variant="button" className="btn-lg" />
            </div>
            {!purchasable ? (
              <p className="text-sm text-muted" role="status">
                Essa combinação está esgotada. Escolha outro switch para continuar.
              </p>
            ) : product.status.kind === "preorder" ? (
              <p className="text-sm text-muted">Pré-venda: você paga agora e o envio acontece em novembro.</p>
            ) : null}
          </div>
        )}


        <DeliveryEstimate freeShipping={price * qty >= 999} />

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="truck" size={18} className="shrink-0" /> Frete grátis acima de R$ 999
          </li>
          <li className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="rotate" size={18} className="shrink-0" /> 7 dias para trocar
          </li>
          <li className="flex items-center gap-2 whitespace-nowrap">
            <Icon name="check" size={18} className="shrink-0" /> Garantia de 1 ano
          </li>
        </ul>
      </div>
    </div>
  );
}
