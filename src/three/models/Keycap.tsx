"use client";

import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { Material, Object3D } from "three";
import { getKeycapGeometry, keycapMetrics, rowProfile, topSurfaceY, type ProfileId } from "../lib/keycapGeometry";
import type { KeyDef } from "../lib/layouts";

export const LEGEND_FONT = "/fonts/archivo-semibold.ttf";

const SHORT: Record<string, string> = { Backspace: "Bksp", Lower: "Low", Raise: "Rse", PrtSc: "Prt" };

const SIZE = { alpha: 4.3, dual: 3.05, mod: 2.45, fn: 2.6, arrow: 4.1, none: 0 } as const;

interface KeycapProps {
  def: KeyDef;
  profile: ProfileId;
  capMaterial: Material;
  legendMaterial: Material;
  characters: string;
  position: [number, number, number];
  registerNode?: (code: string, node: Object3D | null) => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onLegendSync?: (code: string) => void;
}

export function Keycap({
  def,
  profile,
  capMaterial,
  legendMaterial,
  characters,
  position,
  registerNode,
  onPointerDown,
  onLegendSync,
}: KeycapProps) {
  const geometry = getKeycapGeometry(def.w, def.h, profile, def.row);
  const m = keycapMetrics(def.w, def.h, rowProfile(profile, def.row));
  const inset = def.style === "dual" ? 2.2 : 2.35;
  const hw = m.topW / 2;
  const backZ = m.zShift - m.topD / 2 + (def.style === "alpha" ? 1.9 : 2.15);

  let text = def.legend;
  if (def.style === "dual" && def.shift) text = `${def.shift}\n${def.legend}`;
  if (def.w < 1.5 && text.length > 5) text = SHORT[text] ?? text;

  const centered = def.style === "arrow";
  const lz = centered ? m.zShift : backZ;
  const ly = topSurfaceY(m, 0, lz) + 0.05;

  return (
    <group
      ref={(node) => registerNode?.(def.code, node)}
      position={position}
      rotation={def.rotation ? [0, (def.rotation * Math.PI) / 180, 0] : undefined}
      onPointerDown={onPointerDown}
    >
      <mesh geometry={geometry} material={capMaterial} castShadow receiveShadow />
      {def.style !== "none" && text ? (
        <Text
          font={LEGEND_FONT}
          characters={characters}
          fontSize={SIZE[def.style]}
          lineHeight={1.12}
          letterSpacing={def.style === "mod" || def.style === "fn" ? 0.01 : 0}
          anchorX={centered ? "center" : hw - inset}
          anchorY={centered ? "middle" : "top"}
          textAlign="left"
          position={[0, ly, lz]}
          rotation={[-Math.PI / 2 + m.tilt, 0, 0]}
          {...{ curveRadius: m.dishRadius }}
          glyphGeometryDetail={4}
          material={legendMaterial}
          onSync={onLegendSync ? () => onLegendSync(def.code) : undefined}
        >
          {text}
        </Text>
      ) : null}
    </group>
  );
}
