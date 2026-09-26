import { ImageResponse } from "next/og";
import { CATEGORY_LABEL, getProduct, PRODUCTS } from "@/data/products";
import { formatBRL } from "@/lib/format";
import { OG_COLORS, OG_SIZE, OgMark, ogFonts, renderAsPng } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Produto Keyfolk renderizado em 3D";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug) ?? PRODUCTS[0];
  const [fonts, render] = await Promise.all([ogFonts(), renderAsPng(product.render, 900)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG_COLORS.bg,
          fontFamily: "Archivo",
          color: OG_COLORS.ink,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 56px 64px", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <OgMark />
            <span style={{ fontFamily: "Archivo Expanded", fontSize: 30, letterSpacing: -1 }}>Keyfolk</span>
          </div>
          <span style={{ marginTop: 64, fontSize: 24, color: OG_COLORS.muted }}>{CATEGORY_LABEL[product.category]}</span>
          <span style={{ fontFamily: "Archivo Expanded", fontSize: 84, lineHeight: 0.95, letterSpacing: -2, marginTop: 6 }}>
            {product.name}
          </span>
          <span style={{ fontSize: 26, lineHeight: 1.3, color: OG_COLORS.muted, marginTop: 18 }}>{product.tagline}</span>
          <span
            style={{
              marginTop: "auto",
              display: "flex",
              alignSelf: "flex-start",
              background: OG_COLORS.ink,
              color: OG_COLORS.bg,
              borderRadius: 14,
              padding: "10px 18px 12px",
              fontSize: 30,
            }}
          >
            {formatBRL(product.price)}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={render} alt="" width={760} height={760} style={{ position: "absolute", right: -70, top: -65, width: 760, height: 760 }} />
      </div>
    ),
    { ...size, fonts },
  );
}
