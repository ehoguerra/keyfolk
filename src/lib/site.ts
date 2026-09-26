// Explicit override first, then the production domain Vercel injects at build time.
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export const SITE = {
  name: "Keyfolk",
  url: resolveSiteUrl(),
  description:
    "Teclados mecânicos custom, keycaps PBT, switches e deskmats. Montados à mão em São Paulo, com cores que mudam o seu setup.",
  locale: "pt_BR",
  freeShippingThreshold: 999,
  author: { name: "Artur Guerra", url: "https://github.com/ehoguerra" },
  city: "São Paulo, SP",
} as const;

export const NAV_LINKS = [
  { href: "/loja", label: "Loja" },
  { href: "/loja?cat=teclados", label: "Teclados" },
  { href: "/loja?cat=keycaps", label: "Keycaps" },
  { href: "/loja?cat=switches", label: "Switches" },
  { href: "/loja?cat=deskmats", label: "Deskmats" },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
