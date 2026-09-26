import Image from "next/image";
import Link from "next/link";
import { getProduct, type Product } from "@/data/products";
import { installments, formatBRL } from "@/lib/format";
import { FavoriteButton } from "../product/FavoriteButton";
import { StatusBadge } from "../product/StatusBadge";
import { Icon } from "../ui/Icon";
import { Price } from "../ui/Price";
import { SectionHeading } from "./SectionHeading";

function must(slug: string): Product {
  const p = getProduct(slug);
  if (!p) throw new Error(`Produto em destaque ausente: ${slug}`);
  return p;
}

export function FeaturedGrid() {
  const hero = must("folk-75");
  const caps = must("noturno");
  const sw = must("degrau");
  const cable = must("cabo-espiralado-usb-c");
  const inst = installments(hero.price);

  return (
    <section aria-labelledby="destaques" className="container-k mt-24 md:mt-36">
      <SectionHeading id="destaques" title="Em destaque" aside="Os favoritos da bancada neste mês, montados e testados por aqui.">
        <Link href="/loja" className="btn btn-ghost btn-sm">
          Ver tudo
        </Link>
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-12 md:gap-5" data-testid="featured-grid">
        {/* Big tile */}
        <article className="group relative overflow-hidden rounded-[32px] bg-surface md:col-span-7 md:row-span-2" data-testid="featured-product">
          <Link href={`/produto/${hero.slug}`} className="flex h-full flex-col rounded-[32px] p-6 md:p-9">
            <div className="flex items-start justify-between gap-4">
              <StatusBadge status={hero.status} />
            </div>
            <div className="relative -mx-6 my-2 aspect-[4/3] md:-mx-9 md:my-0 md:aspect-auto md:min-h-[380px] md:flex-1">
              <Image
                src={hero.render}
                alt={hero.alt}
                fill
                sizes="(min-width: 768px) 56vw, 100vw"
                className="object-cover object-[50%_62%] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="display text-[2.5rem] md:text-[3.5rem]">{hero.name}</h3>
                <p className="mt-2 max-w-[42ch] text-muted">{hero.tagline}</p>
              </div>
              <div className="flex shrink-0 flex-col md:items-end">
                <Price value={hero.price} compareAt={hero.compareAtPrice} size="lg" />
                <p className="price text-sm text-muted">
                  ou {inst.count}x de {formatBRL(inst.each)} sem juros
                </p>
              </div>
            </div>
          </Link>
          <FavoriteButton productId={hero.id} productName={hero.name} className="absolute right-6 top-6 md:right-9 md:top-8" />
        </article>

        {/* Noturno: its own night palette, whatever the site colorway */}
        <article className="group relative overflow-hidden rounded-[24px] bg-[#1b1733] text-[#ECE8FF] md:col-span-5" data-testid="featured-product">
          <Link href={`/produto/${caps.slug}`} className="grid h-full grid-cols-[1fr_1.1fr] items-center gap-2 rounded-[24px] p-6 md:min-h-[300px] md:p-8">
            <div className="flex flex-col gap-3 self-stretch">
              <p className="ui text-xs text-[#A59FCB]">Keycaps PBT</p>
              <h3 className="display text-[2rem] md:text-[2.5rem]">{caps.name}</h3>
              <p className="text-sm text-[#C9C2F0]">{caps.tagline}</p>
              <p className="price ui mt-auto text-lg">{formatBRL(caps.price)}</p>
            </div>
            <div className="relative -mr-8 aspect-square">
              <Image
                src={caps.render}
                alt={caps.alt}
                fill
                sizes="(min-width: 768px) 22vw, 50vw"
                className="object-contain transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </div>
          </Link>
        </article>

        {/* Degrau */}
        <article className="group relative overflow-hidden rounded-[24px] border border-line bg-bg md:col-span-5" data-testid="featured-product">
          <Link href={`/produto/${sw.slug}`} className="grid h-full grid-cols-[1.1fr_1fr] items-center gap-2 rounded-[24px] p-6 md:min-h-[300px] md:p-8">
            <div className="relative -my-8 -ml-10 aspect-square md:-ml-12">
              <Image
                src={sw.render}
                alt={sw.alt}
                fill
                sizes="(min-width: 768px) 22vw, 50vw"
                className="object-contain transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-col gap-3 self-stretch">
              <p className="ui text-xs text-muted">Switch tátil, 62 g</p>
              <h3 className="display text-[2rem] md:text-[2.5rem]">{sw.name}</h3>
              <p className="text-sm text-muted">{sw.tagline}</p>
              <p className="price ui mt-auto text-lg">
                {formatBRL(sw.price)} <span className="block text-sm font-normal text-muted sm:inline">pack com 70</span>
              </p>
            </div>
          </Link>
        </article>

        {/* Cable: wide banner */}
        <article className="group relative overflow-hidden rounded-[24px] bg-ink text-bg md:col-span-12" data-testid="featured-product">
          <Link
            href={`/produto/${cable.slug}`}
            className="grid items-center gap-4 rounded-[24px] p-6 md:grid-cols-12 md:gap-6 md:p-10"
          >
            <div className="flex flex-col gap-3 md:col-span-5">
              <p className="ui text-xs opacity-70">O detalhe que faltava</p>
              <h3 className="display text-[2rem] md:text-[2.75rem]">{cable.name}</h3>
              <p className="max-w-[44ch] text-sm opacity-80">{cable.tagline}</p>
              <p className="ui mt-2 inline-flex items-center gap-2 text-base">
                <span className="price">{formatBRL(cable.price)}</span>
                <span aria-hidden="true" className="opacity-50">
                  /
                </span>
                <span className="underline underline-offset-4">Ver o cabo</span>
                <Icon name="arrow-right" size={18} />
              </p>
            </div>
            <div className="relative -mb-10 h-64 md:col-span-7 md:-mt-10 md:h-72">
              <Image
                src={cable.render}
                alt={cable.alt}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover object-center transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
              />
            </div>
          </Link>
        </article>
      </div>
    </section>
  );
}
