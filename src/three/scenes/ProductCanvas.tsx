"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useState } from "react";
import { maxDpr } from "@/lib/live3d";
import type { Product } from "@/data/products";
import { ProductScene, stageForProduct } from "./ProductScene";
import { StageCanvas } from "./StageCanvas";
import { SlicedMount } from "../lib/SlicedMount";
import { useCompileGate } from "../lib/useCompileGate";

interface ProductCanvasProps {
  product: Product;
  caseId?: string;
  active: boolean;
  autoRotate: boolean;
  onReady: () => void;
  onInteract: () => void;
  className?: string;
}

/** Interactive viewer: rotate and a little zoom, no pan. Lazy-loaded with ssr: false. */
export default function ProductCanvas({ product, caseId, active, autoRotate, onReady, onInteract, className }: ProductCanvasProps) {
  const stage = stageForProduct(product);
  const [top] = useState(maxDpr);
  const [dpr, setDpr] = useState<number | [number, number]>([1, top]);
  const gate = useCompileGate(onReady);
  return (
    <StageCanvas
      stage={stage}
      controlled
      frameloop={active && gate.compiled ? "demand" : "never"}
      onCreated={gate.onCreated}
      dpr={dpr}
      className={className}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr([1, top])} />
      <OrbitControls
        makeDefault
        target={stage.target}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={stage.minDistance}
        maxDistance={stage.maxDistance}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.12}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        rotateSpeed={0.7}
        zoomSpeed={0.6}
        onStart={onInteract}
      />
      <SlicedMount>
        <Suspense fallback={null}>
          <ProductScene product={product} caseId={caseId} onReady={gate.onSceneReady} />
        </Suspense>
      </SlicedMount>
    </StageCanvas>
  );
}
