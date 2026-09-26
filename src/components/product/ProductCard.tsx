import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, type Product } from "@/data/products";
import { Price } from "../ui/Price";
import { FavoriteButton } from "./FavoriteButton";
import { StatusBadge } from "./StatusBadge";

interface ProductCardProps {
  product: Product;
  sizes?: string;
  /** Likely LCP candidate: load eagerly with high fetch priority. */
  priority?: boolean;
  /** Above the fold: load immediately (no lazy loading). */
  eager?: boolean;
  headingLevel?: "h2" | "h3";
}

export function ProductCard({
  product,
  sizes = "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw",
  priority = false,
  eager = false,
  headingLevel = "h3",
}: ProductCardProps) {
  const Heading = headingLevel;
  return (
    <article className="group relative" data-testid="product-card">
      <Link href={`/produto/${product.slug}`} className="block rounded-[22px]">
        <div className="relative aspect-square overflow-hidden rounded-[22px] bg-surface">
          <Image
            src={product.render}
            alt={product.alt}
            fill
            sizes={sizes}
            loading={priority || eager ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="object-contain transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
          />
          {product.status.kind !== "in-stock" ? (
            <StatusBadge status={product.status} compact className="absolute left-3 top-3" />
          ) : null}
        </div>
        <div className="mt-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{CATEGORY_LABEL[product.category]}</p>
            <Heading className="ui text-[1.0625rem] leading-snug">{product.name}</Heading>
          </div>
          <Price value={product.price} compareAt={product.compareAtPrice} size="sm" className="sm:shrink-0 sm:justify-end sm:text-right" />
        </div>
      </Link>
      <FavoriteButton productId={product.id} productName={product.name} className="absolute right-3 top-3" />
    </article>
  );
}
