"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { useLive3d } from "@/lib/live3d";
import { Icon } from "../ui/Icon";

const ProductCanvas = dynamic(() => import("@/three/scenes/ProductCanvas"), { ssr: false });

interface ProductViewerProps {
  product: Product;
  caseId?: string;
  poster: string;
}

export function ProductViewer({ product, caseId, poster }: ProductViewerProps) {
  const mounted = useLive3d();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [interacted, setInteracted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "60px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pv-viewer"
      data-ready={ready ? "true" : "false"}
      data-testid="product-viewer"
      aria-label={`Visualização 3D de ${product.name}. Arraste para girar e use a roda do mouse ou pinça para aproximar.`}
      role="group"
    >
      <div className="pv-poster">
        <Image
          src={poster}
          alt={product.alt}
          fill
          preload
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-contain"
          quality={85}
        />
      </div>
      {mounted ? (
        <ProductCanvas
          className="pv-canvas"
          product={product}
          caseId={caseId}
          active={visible}
          autoRotate={!interacted && !reduced}
          onReady={() => setReady(true)}
          onInteract={() => setInteracted(true)}
        />
      ) : null}
      <p className="pv-hint" data-hidden={interacted || !ready ? "true" : "false"} aria-hidden="true">
        <Icon name="rotate" size={16} />
        Arraste para girar
      </p>
    </div>
  );
}
