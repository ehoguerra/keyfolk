"use client";

import { Suspense, useCallback } from "react";
import { getProduct } from "@/data/products";
import { isColorwayId } from "@/lib/colorways";
import { HERO_STAGE, LAB_STAGE } from "./config";
import { HeroScene } from "./HeroScene";
import { ProductScene, stageForProduct } from "./ProductScene";
import { StageCanvas } from "./StageCanvas";
import { SwitchLabScene } from "./SwitchLabCanvas";

declare global {
  interface Window {
    __RENDER_READY__?: boolean;
  }
}

/** Full-viewport canvas used by scripts/render-products.mjs to produce the product images. */
export default function RenderCanvas({ slug }: { slug: string }) {
  const markReady = useCallback(() => {
    // give contact shadows / environment a few frames to settle
    let frames = 0;
    const tick = () => {
      frames += 1;
      if (frames < 12) requestAnimationFrame(tick);
      else window.__RENDER_READY__ = true;
    };
    requestAnimationFrame(tick);
  }, []);

  if (slug.startsWith("hero-")) {
    const cw = slug.slice(5);
    if (!isColorwayId(cw)) return <p>Colorway desconhecido: {cw}</p>;
    return (
      <StageCanvas stage={HERO_STAGE} frameloop="always" dpr={1} preserveDrawingBuffer style={{ width: "100vw", height: "100vh" }}>
        <Suspense fallback={null}>
          <HeroScene colorway={cw} onReady={markReady} />
        </Suspense>
      </StageCanvas>
    );
  }

  if (slug.startsWith("lab-")) {
    const bySlug = { linear: "creme", tatil: "degrau", clicky: "estalo" } as const;
    const type = slug.slice(4) as keyof typeof bySlug;
    const product = bySlug[type] ? getProduct(bySlug[type]) : undefined;
    if (!product) return <p>Tipo desconhecido: {type}</p>;
    return (
      <StageCanvas stage={LAB_STAGE} frameloop="always" dpr={1} preserveDrawingBuffer style={{ width: "100vw", height: "100vh" }}>
        <Suspense fallback={null}>
          <SwitchLabScene product={product} onReady={markReady} />
        </Suspense>
      </StageCanvas>
    );
  }

  const [productSlug, caseId] = slug.split("--");
  const product = getProduct(productSlug);
  if (!product) return <p>Produto não encontrado: {productSlug}</p>;
  const stage = stageForProduct(product);
  return (
    <StageCanvas stage={stage} frameloop="always" dpr={1} preserveDrawingBuffer style={{ width: "100vw", height: "100vh" }}>
      <Suspense fallback={null}>
        <ProductScene product={product} caseId={caseId} onReady={markReady} />
      </Suspense>
    </StageCanvas>
  );
}
