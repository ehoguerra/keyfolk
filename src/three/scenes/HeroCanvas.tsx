"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useState } from "react";
import { maxDpr } from "@/lib/live3d";
import type { ColorwayId } from "@/lib/colorways";
import type { KeyAnimator } from "../lib/keyAnimator";
import { HERO_STAGE } from "./config";
import { HeroScene } from "./HeroScene";
import { StageCanvas } from "./StageCanvas";
import { SlicedMount } from "../lib/SlicedMount";
import { useCompileGate } from "../lib/useCompileGate";

interface HeroCanvasProps {
  colorway: ColorwayId;
  animator: KeyAnimator;
  active: boolean;
  onReady: () => void;
  onKeyPointerDown: (code: string) => void;
  className?: string;
}

/** Lazily loaded (next/dynamic, ssr: false) after the hero poster has painted. */
export default function HeroCanvas({ colorway, animator, active, onReady, onKeyPointerDown, className }: HeroCanvasProps) {
  const [top] = useState(maxDpr);
  const [dpr, setDpr] = useState<number | [number, number]>([1, top]);
  const gate = useCompileGate(onReady);
  return (
    <StageCanvas
      stage={HERO_STAGE}
      frameloop={active && gate.compiled ? "demand" : "never"}
      onCreated={gate.onCreated}
      dpr={dpr}
      className={className}
      style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr([1, top])} />
      <SlicedMount>
        <Suspense fallback={null}>
          <HeroScene
            colorway={colorway}
            animator={animator}
            animatePalette
            onKeyPointerDown={onKeyPointerDown}
            onReady={gate.onSceneReady}
          />
        </Suspense>
      </SlicedMount>
    </StageCanvas>
  );
}
