"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { Icon } from "../ui/Icon";
import { Sheet } from "../ui/Sheet";
import { LogoMark } from "./Logo";

const POPULAR = ["Folk 75", "Noturno", "tátil", "deskmat"];

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const router = useRouter();
  return (
    <>
      <button type="button" className="icon-btn" aria-label="Buscar produtos" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Icon name="search" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="top" labelledBy={titleId}>
        <div className="container-k py-6 md:py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="ui text-lg">
              Buscar na loja
            </h2>
            <button type="button" className="icon-btn" aria-label="Fechar busca" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <form
            role="search"
            action="/loja"
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
              setOpen(false);
              router.push(q ? `/loja?q=${encodeURIComponent(q)}` : "/loja");
            }}
          >
            <label htmlFor={`${titleId}-q`} className="sr-only">
              O que você procura?
            </label>
            <input
              id={`${titleId}-q`}
              name="q"
              type="search"
              className="input text-lg"
              placeholder="Teclado 75%, keycaps roxas, switch tátil…"
              autoComplete="off"
              autoFocus
            />
            <button type="submit" className="btn btn-primary shrink-0">
              Buscar
            </button>
          </form>
          <p className="mt-4 text-sm text-muted">
            Mais buscados:{" "}
            {POPULAR.map((term, i) => (
              <span key={term}>
                {i > 0 ? ", " : ""}
                <Link className="link" href={`/loja?q=${encodeURIComponent(term)}`} onClick={() => setOpen(false)}>
                  {term}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </Sheet>
    </>
  );
}

const MENU = [{ href: "/", label: "Início" }, ...NAV_LINKS, { href: "/loja?cat=acessorios", label: "Acessórios" }];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  return (
    <>
      <button
        type="button"
        className="icon-btn -ml-2 md:hidden"
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="left" labelledBy={titleId}>
        <div className="flex h-full flex-col px-5 pb-8 pt-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2.5">
              <LogoMark />
              <h2 id={titleId} className="display text-xl">
                Menu
              </h2>
            </span>
            <button type="button" className="icon-btn" aria-label="Fechar menu" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Menu principal" className="mt-8">
            <ul className="flex flex-col">
              {MENU.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-center justify-between py-4 text-[1.75rem]"
                  >
                    {l.label}
                    <Icon name="arrow-right" size={20} className="text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-2 pt-8 text-sm text-muted">
            <Link href="/favoritos" className="link w-fit" onClick={() => setOpen(false)}>
              Seus favoritos
            </Link>
            <Link href="/carrinho" className="link w-fit" onClick={() => setOpen(false)}>
              Carrinho
            </Link>
          </div>
        </div>
      </Sheet>
    </>
  );
}
