import Link from "next/link";
import { SITE } from "@/lib/site";
import { ColorwayPicker } from "../colorway/ColorwayPicker";
import { LogoMark } from "./Logo";

const COLUMNS = [
  {
    title: "Loja",
    links: [
      { href: "/loja?cat=teclados", label: "Teclados" },
      { href: "/loja?cat=keycaps", label: "Keycaps" },
      { href: "/loja?cat=switches", label: "Switches" },
      { href: "/loja?cat=deskmats", label: "Deskmats" },
      { href: "/loja?cat=acessorios", label: "Acessórios" },
    ],
  },
  {
    title: "Sua conta",
    links: [
      { href: "/carrinho", label: "Carrinho" },
      { href: "/favoritos", label: "Favoritos" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
  {
    title: "Destaques",
    links: [
      { href: "/produto/folk-75", label: "Folk 75" },
      { href: "/produto/noturno", label: "Keycaps Noturno" },
      { href: "/produto/degrau", label: "Switch Degrau" },
      { href: "/produto/cabo-espiralado-usb-c", label: "Cabo espiralado" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2 md:mt-32">
      <div className="container-k grid-k gap-y-12 py-14 md:py-20">
        <div className="col-span-4 flex flex-col gap-5 md:col-span-5">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5 rounded-lg">
            <LogoMark size={34} />
            <span className="display text-2xl">Keyfolk</span>
          </Link>
          <p className="max-w-[40ch] text-muted">
            Teclados mecânicos montados à mão em {SITE.city}. Cada pedido sai testado tecla por tecla, com o som que a gente
            gostaria de ouvir na nossa mesa.
          </p>
          <ColorwayPicker size="sm" />
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="col-span-2 md:col-span-2">
            <h2 className="ui text-sm text-muted">{col.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="rounded hover:underline hover:underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-k flex flex-col gap-2 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Keyfolk. Projeto de portfólio: nenhum pedido é real e nenhum dado sai do seu navegador.</p>
          <p>
            Imagens renderizadas em 3D por nós, sem fotos de banco. Feito por{" "}
            <a className="link" href={SITE.author.url} rel="author">
              {SITE.author.name}
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
