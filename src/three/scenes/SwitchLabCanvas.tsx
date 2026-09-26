"use client";

import { Suspense } from "react";
import type { Product } from "@/data/products";
import type { KeyAnimator } from "../lib/keyAnimator";
import { SwitchModel } from "../models/Switch";
import { LAB_KEYCAP, LAB_STAGE } from "./config";
import { StageCanvas } from "./StageCanvas";
import { SlicedMount } from "../lib/SlicedMount";
import { useCompileGate } from "../lib/useCompileGate";
import { Studio } from "./Studio";

export function SwitchLabScene({
  product,
  animator,
  onReady,
  onPress,
}: {
  product: Product;
  animator?: KeyAnimator;
  onReady?: () => void;
  onPress?: () => void;
}) {
  if (product.model.kind !== "switch") return null;
  return (
    <>
      <Studio shadowSize={LAB_STAGE.shadowSize} contactShadow={LAB_STAGE.contact} />
      <group
        onPointerDown={
          onPress
            ? (e) => {
                e.stopPropagation();
                onPress();
              }
            : undefined
        }
      >
        <SwitchModel spec={product.model} animator={animator} keycap={LAB_KEYCAP} onReady={onReady} scale={0.1} />
      </group>
    </>
  );
}

interface SwitchLabCanvasProps {
  product: Product;
  animator: KeyAnimator;
  active: boolean;
  onReady: () => void;
  onPress: () => void;
  className?: string;
}

export default function SwitchLabCanvas({ product, animator, active, onReady, onPress, className }: SwitchLabCanvasProps) {
  const gate = useCompileGate(onReady);
  return (
    <StageCanvas
      stage={LAB_STAGE}
      frameloop={active && gate.compiled ? "demand" : "never"}
      onCreated={gate.onCreated}
      className={className}
      style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
    >
      <SlicedMount>
        <Suspense fallback={null}>
          <SwitchLabScene key={product.id} product={product} animator={animator} onReady={gate.onSceneReady} onPress={onPress} />
        </Suspense>
      </SlicedMount>
    </StageCanvas>
  );
}
