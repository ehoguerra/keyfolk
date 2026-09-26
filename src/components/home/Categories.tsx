import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, type Category } from "@/data/products";
import { Icon } from "../ui/Icon";
import { SectionHeading } from "./SectionHeading";

interface Tile {
  cat: Category;
  title: string;
  note: string;
  image: string;
  alt: string;
  className: string;
  imageClass: string;
  /** object-fit/position of the render inside its box (renders are square with generous margins). */
  fit: string;
}

const TILES: Tile[] = [
  {
    cat: "teclados",
    title: "Teclados",
    note: "75%, 65%, TKL e um ortolinear para quem gosta de camadas.",
    image: "/renders/folk-65.webp",
    alt: "Teclado Folk 65",
    className: "md:col-span-6 md:row-span-2 min-h-[380px] md:min-h-[560px]",
    imageClass: "absolute inset-x-[5%] bottom-[2%] top-[30%] md:top-[28%]",
    fit: "object-cover object-[50%_60%]",
  },
  {
    cat: "keycaps",
    title: "Keycaps",
    note: "PBT dye-sub em cinco colorways.",
    image: "/renders/mochi.webp",
    alt: "Keycaps Mochi",
    className: "md:col-span-6 min-h-[260px]",
    imageClass: "absolute -right-4 bottom-[-14%] top-[2%] w-[58%]",
    fit: "object-contain",
  },
  {
    cat: "switches",
    title: "Switches",
    note: "Linear, tátil ou clicky.",
    image: "/renders/creme.webp",
    alt: "Switch Creme",
    className: "md:col-span-3 min-h-[260px]",
    imageClass: "absolute inset-x-[-6%] bottom-[-8%] top-[30%]",
    fit: "object-contain",
  },
  {
    cat: "deskmats",
    title: "Deskmats",
    note: "90 × 40 cm.",
    image: "/renders/grade.webp",
    alt: "Deskmat Grade",
    className: "md:col-span-3 min-h-[260px]",
    imageClass: "absolute inset-x-[-6%] bottom-[-14%] top-[28%]",
    fit: "object-contain",
  },
];

export function Categories() {
  const counts = PRODUCTS.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <section aria-labelledby="categorias" className="container-k mt-24 md:mt-36">
      <SectionHeading id="categorias" title="Categorias" aside="Tudo o que vai do plate ao cabo, escolhido e testado por aqui." />
      <ul className="mt-8 grid grid-cols-2 gap-4 md:mt-12 md:grid-cols-12 md:gap-5">
        {TILES.map((t, i) => (
          <li key={t.cat} className={`${i === 0 ? "col-span-2" : i === 1 ? "col-span-2" : "col-span-1"} ${t.className}`}>
            <Link
              href={`/loja?cat=${t.cat}`}
              className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] p-5 md:p-7 ${
                i === 0 ? "bg-case" : "bg-surface"
              }`}
            >
              <div className="relative z-10 flex flex-col gap-1">
                <h3 className={`display ${i === 0 ? "text-[2.5rem] md:text-[3.5rem]" : i === 1 ? "text-[1.75rem] md:text-[2rem]" : "text-[clamp(1.125rem,5vw,1.75rem)] md:text-[2rem]"}`}>
                  {t.title}
                </h3>
                <p className={`max-w-[26ch] text-sm ${i === 0 ? "text-ink/80" : "text-muted"}`}>{t.note}</p>
                <p className="ui mt-2 inline-flex items-center gap-1.5 text-sm">
                  {counts[t.cat] ?? 0} {counts[t.cat] === 1 ? "produto" : "produtos"}
                  <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
              <div className={t.imageClass}>
                <Image
                  src={t.image}
                  alt={t.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className={`${t.fit} transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]`}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
