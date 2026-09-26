import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/loja"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...(["teclados", "keycaps", "switches", "deskmats", "acessorios"] as const).map((cat) => ({
      url: absoluteUrl(`/loja?cat=${cat}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...PRODUCTS.map((p) => ({
      url: absoluteUrl(`/produto/${p.slug}`),
      lastModified: new Date(p.releasedAt),
      changeFrequency: "monthly" as const,
      priority: p.featured ? 0.8 : 0.6,
      images: [absoluteUrl(p.render)],
    })),
  ];
}
