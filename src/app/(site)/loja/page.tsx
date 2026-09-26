import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { CatalogView } from "@/components/catalog/CatalogView";
import { EMPTY_QUERY } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Loja",
  description: "Teclados 75%, 65%, TKL e ortolinear, keycaps PBT dye-sub, switches lubrificados, deskmats e cabos espiralados.",
  alternates: { canonical: "/loja" },
  openGraph: { title: "Loja — Keyfolk", url: "/loja" },
};

export default function LojaPage() {
  return (
    // The fallback is the full, unfiltered catalog, so the static HTML already lists every product.
    <Suspense fallback={<CatalogView query={EMPTY_QUERY} />}>
      <CatalogClient />
    </Suspense>
  );
}
