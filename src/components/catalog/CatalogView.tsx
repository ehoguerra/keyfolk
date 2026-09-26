"use client";

import { useId, useState, type ReactNode } from "react";
import { CATEGORY_LABEL, PRODUCTS } from "@/data/products";
import {
  CATEGORY_FILTERS,
  filterProducts,
  hasFilters,
  LAYOUT_FILTERS,
  PRICE_RANGES,
  SORTS,
  SWITCH_FILTERS,
  type CatalogQuery,
  type SortId,
} from "@/lib/catalog";
import { pluralize } from "@/lib/format";
import { ProductCard } from "../product/ProductCard";
import { Icon } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";

interface CatalogViewProps {
  query: CatalogQuery;
  /** Absent while prerendering (the static fallback): controls render but do nothing yet. */
  onChange?: (next: CatalogQuery, opts?: { debounce?: boolean }) => void;
  searchValue?: string;
  onSearchInput?: (value: string) => void;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function CatalogView({ query, onChange, searchValue, onSearchInput }: CatalogViewProps) {
  const results = filterProducts(PRODUCTS, query);
  const withoutCat = filterProducts(PRODUCTS, query, true);
  const set = (patch: Partial<CatalogQuery>) => onChange?.({ ...query, ...patch });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sheetTitle = useId();
  const searchId = useId();
  const sortId = useId();
  const title = query.cat === "todos" ? "Loja" : CATEGORY_LABEL[query.cat];
  const showLayout = query.cat === "todos" || query.cat === "teclados";
  const showSwitch = query.cat === "todos" || query.cat === "teclados" || query.cat === "switches";
  const active = hasFilters({ ...query, cat: "todos" });
  const extraCount = query.layouts.length + query.switches.length + (query.price ? 1 : 0) + (query.stock ? 1 : 0);

  const filters = (
    <div className="flex flex-col gap-8">
      {showLayout ? (
        <FilterGroup legend="Layout do teclado">
          {LAYOUT_FILTERS.map((l) => (
            <label key={l.id} className="chip">
              <input
                type="checkbox"
                className="sr-only"
                checked={query.layouts.includes(l.id)}
                onChange={() => set({ layouts: toggle(query.layouts, l.id) })}
              />
              {l.label}
            </label>
          ))}
        </FilterGroup>
      ) : null}
      {showSwitch ? (
        <FilterGroup legend="Tipo de switch">
          {SWITCH_FILTERS.map((s) => (
            <label key={s.id} className="chip">
              <input
                type="checkbox"
                className="sr-only"
                checked={query.switches.includes(s.id)}
                onChange={() => set({ switches: toggle(query.switches, s.id) })}
              />
              {s.label}
            </label>
          ))}
        </FilterGroup>
      ) : null}
      <FilterGroup legend="Faixa de preço">
        <label className="chip">
          <input type="radio" name="preco" className="sr-only" checked={!query.price} onChange={() => set({ price: null })} />
          Qualquer preço
        </label>
        {PRICE_RANGES.map((r) => (
          <label key={r.id} className="chip">
            <input
              type="radio"
              name="preco"
              className="sr-only"
              checked={query.price === r.id}
              onChange={() => set({ price: r.id })}
            />
            {r.label}
          </label>
        ))}
      </FilterGroup>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[14px] border border-line bg-surface px-4 py-3">
        <span>
          <span className="ui block">Só em estoque</span>
          <span className="text-sm text-muted">Esconde pré-venda e esgotados</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={query.stock}
          onChange={(e) => set({ stock: e.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)] after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-bg after:shadow after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>
      {active ? (
        <button type="button" className="btn btn-ghost btn-sm self-start" onClick={() => onChange?.({ ...query, q: "", layouts: [], switches: [], price: null, stock: false })}>
          Limpar filtros
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="container-k pt-10 md:pt-14">
      <div className="grid-k items-end gap-y-4">
        <div className="col-span-4 md:col-span-8">
          <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">{title}</h1>
          <p className="mt-3 text-muted" aria-live="polite" data-testid="result-count">
            {pluralize(results.length, "produto", "produtos")}
            {query.q.trim() ? ` para “${query.q.trim()}”` : ""}
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <nav aria-label="Categorias" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-2 pb-1">
          {CATEGORY_FILTERS.map((c) => {
            const count = c.id === "todos" ? withoutCat.length : withoutCat.filter((p) => p.category === c.id).length;
            const current = query.cat === c.id;
            return (
              <li key={c.id}>
                <a
                  href={`/loja${c.id === "todos" ? "" : `?cat=${c.id}`}`}
                  aria-current={current ? "page" : undefined}
                  className="chip"
                  onClick={(e) => {
                    if (!onChange) return;
                    e.preventDefault();
                    set({ cat: c.id, layouts: c.id === "teclados" || c.id === "todos" ? query.layouts : [] });
                  }}
                >
                  {c.label}
                  <span className="price text-xs opacity-70">{count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-6">
        <aside className="hidden md:col-span-3 md:block" aria-label="Filtros">
          <div className="sticky top-24">{filters}</div>
        </aside>

        <div className="md:col-span-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <form
              role="search"
              className="flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                onChange?.({ ...query, q: searchValue ?? query.q });
              }}
            >
              <label htmlFor={searchId} className="sr-only">
                Buscar produtos
              </label>
              <div className="relative">
                <Icon name="search" size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id={searchId}
                  type="search"
                  name="q"
                  className="input pl-11"
                  placeholder="Buscar por nome, layout, switch…"
                  value={searchValue ?? query.q}
                  onChange={(e) => onSearchInput?.(e.target.value)}
                  autoComplete="off"
                  data-testid="catalog-search"
                />
              </div>
            </form>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn flex-1 md:hidden"
                onClick={() => setFiltersOpen(true)}
                aria-haspopup="dialog"
              >
                <Icon name="filter" size={18} />
                Filtros{extraCount ? ` (${extraCount})` : ""}
              </button>
              <div className="flex-1 sm:w-52 sm:flex-none">
                <label htmlFor={sortId} className="sr-only">
                  Ordenar por
                </label>
                <select
                  id={sortId}
                  className="input"
                  value={query.sort}
                  onChange={(e) => set({ sort: e.target.value as SortId })}
                  data-testid="catalog-sort"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {results.length ? (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6" data-testid="product-grid">
              {results.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} headingLevel="h2" priority={i < 2} eager={i < 6} sizes="(min-width: 1360px) 330px, (min-width: 1024px) 24vw, 46vw" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 flex flex-col items-start gap-5 rounded-[28px] border border-dashed border-line-strong p-8 md:p-12" data-testid="empty-state">
              <p className="display text-[2rem] md:text-[2.5rem]">Nenhum produto com esses filtros.</p>
              <p className="max-w-[46ch] text-muted">
                Tente tirar um filtro ou buscar outra palavra. Dica: “tátil”, “75%” e “roxo” sempre encontram alguma coisa.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onChange?.({ ...query, cat: "todos", q: "", layouts: [], switches: [], price: null, stock: false })}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} labelledBy={sheetTitle}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id={sheetTitle} className="display text-2xl">
              Filtros
            </h2>
            <button type="button" className="icon-btn -mr-2" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros">
              <Icon name="close" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
          <div className="border-t border-line p-5">
            <button type="button" className="btn btn-primary btn-lg w-full" onClick={() => setFiltersOpen(false)}>
              Ver {pluralize(results.length, "produto", "produtos")}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="ui mb-3 text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
