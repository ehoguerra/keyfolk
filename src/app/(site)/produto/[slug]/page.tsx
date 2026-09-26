import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductExperience } from "@/components/product/ProductExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORY_LABEL, getProduct, getRelated, PRODUCTS } from "@/data/products";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = `${product.name}, ${CATEGORY_LABEL[product.category].toLowerCase()}`;
  return {
    title,
    description: product.tagline,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — Keyfolk`,
      description: product.tagline,
      url: `/produto/${product.slug}`,
    },
    twitter: { card: "summary_large_image", title: `${product.name} — Keyfolk`, description: product.tagline },
  };
}

const AVAILABILITY = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  preorder: "https://schema.org/PreOrder",
  "sold-out": "https://schema.org/OutOfStock",
} as const;

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelated(product);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description.join(" "),
          image: absoluteUrl(product.render),
          sku: product.id,
          category: CATEGORY_LABEL[product.category],
          brand: { "@type": "Brand", name: SITE.name },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/produto/${product.slug}`),
            priceCurrency: "BRL",
            price: product.price.toFixed(2),
            availability: AVAILABILITY[product.status.kind],
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: SITE.name },
          },
        }}
      />
      <div className="container-k pt-6 md:pt-8">
        <nav aria-label="Você está em" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/loja" className="hover:text-ink hover:underline">
                Loja
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/loja?cat=${product.category}`} className="hover:text-ink hover:underline">
                {CATEGORY_LABEL[product.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6">
          <ProductExperience slug={product.slug} />
        </div>

        <section aria-labelledby="sobre" className="mt-20 grid grid-cols-1 gap-10 md:mt-28 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2 id="sobre" className="display text-[clamp(2rem,3.6vw,2.75rem)]">
              Sobre o {product.name}
            </h2>
            <div className="prose-k mt-6 flex flex-col gap-4 text-lg leading-relaxed">
              {product.description.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <details className="group rounded-[22px] border border-line bg-surface open:pb-2" open>
              <summary className="ui flex cursor-pointer list-none items-center justify-between gap-4 rounded-[22px] px-5 py-4 text-lg [&::-webkit-details-marker]:hidden">
                Especificações técnicas
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-bg text-xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dl className="px-5">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 border-t border-line py-3 text-[0.9375rem]">
                    <dt className="text-muted">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="group mt-3 rounded-[22px] border border-line">
              <summary className="ui flex cursor-pointer list-none items-center justify-between gap-4 rounded-[22px] px-5 py-4 text-lg [&::-webkit-details-marker]:hidden">
                Envio, trocas e garantia
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-surface text-xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="flex flex-col gap-3 px-5 pb-5 text-[0.9375rem] text-muted">
                <p>Enviamos de São Paulo em até 1 dia útil, com código de rastreio por e-mail. Frete grátis (PAC) acima de R$ 999.</p>
                <p>Você tem 7 dias depois de receber para trocar ou devolver, sem perguntas. Garantia de 1 ano contra defeitos.</p>
              </div>
            </details>
          </div>
        </section>

        {related.length ? (
          <section aria-labelledby="combina" className="mt-20 md:mt-28">
            <h2 id="combina" className="display text-[clamp(2rem,3.6vw,2.75rem)]">
              Combina com
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} sizes="(min-width: 768px) 25vw, 50vw" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
