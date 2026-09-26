import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { COLORWAY_IDS } from "@/lib/colorways";
import { renderSlugs } from "@/lib/variants";
import { RenderClient } from "./RenderClient";

export const metadata: Metadata = {
  title: "Render",
  robots: { index: false, follow: false },
};

interface RenderJob {
  slug: string;
  width: number;
  height: number;
}

function manifest(): RenderJob[] {
  return [
    ...PRODUCTS.flatMap((p) => renderSlugs(p).map((slug) => ({ slug, width: 1600, height: 1600 }))),
    ...COLORWAY_IDS.map((id) => ({ slug: `hero-${id}`, width: 2250, height: 900 })),
    ...(["linear", "tatil", "clicky"] as const).map((t) => ({ slug: `lab-${t}`, width: 1200, height: 1200 })),
  ];
}

/**
 * Dev-only route that renders a single product model on a transparent page.
 * `npm run render` screenshots it to produce public/renders/*.webp.
 * /render/manifest lists every image the site needs.
 */
export default async function RenderPage({ params }: PageProps<"/render/[slug]">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { slug } = await params;
  if (slug === "manifest") {
    return (
      <script
        id="render-manifest"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(manifest()) }}
      />
    );
  }
  return (
    <div className="render-root" style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <RenderClient slug={slug} />
    </div>
  );
}
