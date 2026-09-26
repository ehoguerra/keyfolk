"use client";

import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { pluralize } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import { useFavorites } from "@/store/favorites";
import { Icon } from "../ui/Icon";
import { ProductCard } from "./ProductCard";

export function FavoritesView() {
  const ids = useFavorites((s) => s.ids);
  const hydrated = useHydrated(useFavorites);
  const products = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <>
      <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Favoritos</h1>
      {!hydrated ? (
        <div className="h-[40vh]" aria-busy="true" />
      ) : products.length ? (
        <>
          <p className="mt-3 text-muted">{pluralize(products.length, "produto guardado", "produtos guardados")} neste navegador.</p>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6" data-testid="favorites-grid">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} headingLevel="h2" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-8 flex flex-col items-start gap-5 rounded-[28px] border border-dashed border-line-strong p-8 md:p-12">
          <span className="grid size-14 place-items-center rounded-[14px] bg-surface text-ink">
            <Icon name="heart" size={26} />
          </span>
          <p className="display text-[2rem]">Nenhum favorito ainda.</p>
          <p className="max-w-[46ch] text-muted">
            Toque no coração de qualquer produto para guardar aqui. Fica salvo neste navegador, sem precisar de conta.
          </p>
          <Link href="/loja" className="btn btn-primary btn-lg">
            Explorar a loja
          </Link>
        </div>
      )}
    </>
  );
}
