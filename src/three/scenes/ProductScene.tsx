"use client";

import { useMemo } from "react";
import type { Product } from "@/data/products";
import { KEYBOARD_LAYOUTS, LAYOUT_CLUSTER } from "../lib/layouts";
import { keyboardPalette } from "../lib/palette";
import { CableModel } from "../models/Cable";
import { DeskmatModel } from "../models/Deskmat";
import { KeyboardModel, keyboardDims } from "../models/Keyboard";
import { SwitchModel } from "../models/Switch";
import { productStage, type StageConfig } from "./config";
import { Studio } from "./Studio";

export interface ProductSceneOptions {
  caseId?: string;
}

/** Largest horizontal extent of a product model, in world units (used to frame the camera). */
export function productSize(product: Product): number {
  if (product.model.kind === "keyboard") {
    const dims = keyboardDims(KEYBOARD_LAYOUTS[product.model.layout], true);
    return Math.max(dims.outerW, dims.outerD) / 100;
  }
  return 3.3;
}

const stageCache = new Map<string, StageConfig>();

/** Memoized per product so the camera config keeps a stable identity across renders. */
export function stageForProduct(product: Product): StageConfig {
  let stage = stageCache.get(product.id);
  if (!stage) {
    stage = productStage(product.model, productSize(product));
    stageCache.set(product.id, stage);
  }
  return stage;
}

export function ProductScene({ product, caseId, onReady }: { product: Product; caseId?: string; onReady?: () => void }) {
  const stage = stageForProduct(product);
  return (
    <>
      <Studio shadowSize={stage.shadowSize} contactShadow={stage.contact} />
      <ProductModel product={product} caseId={caseId} onReady={onReady} />
    </>
  );
}

function ProductModel({ product, caseId, onReady }: { product: Product; caseId?: string; onReady?: () => void }) {
  const spec = product.model;
  const cases = product.options.cases;
  const chosen = cases?.find((c) => c.id === caseId) ?? cases?.[0];
  const palette = useMemo(
    () => (chosen ? keyboardPalette(chosen.hex, chosen.capset) : spec.kind === "keycaps" ? keyboardPalette("#cccccc", spec.colorway) : null),
    [chosen, spec],
  );

  switch (spec.kind) {
    case "keyboard":
      return (
        <group scale={0.01}>
          <KeyboardModel layout={KEYBOARD_LAYOUTS[spec.layout]} palette={palette!} animatePalette onReady={onReady} />
        </group>
      );
    case "keycaps":
      return (
        <group scale={0.0142} position={[0.22, 0, 0.02]} rotation={[0, 0.1, 0]}>
          <KeyboardModel layout={LAYOUT_CLUSTER} palette={palette!} withCase={false} onReady={onReady} />
        </group>
      );
    case "switch":
      return <SwitchModel spec={spec} onReady={onReady} />;
    case "deskmat":
      return <DeskmatModel spec={spec} onReady={onReady} />;
    case "cable":
      return <CableModel spec={spec} onReady={onReady} />;
  }
}
