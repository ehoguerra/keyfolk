"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
  type Group,
} from "three";
import type { ModelSpec } from "@/data/products";
import type { KeyAnimator } from "../lib/keyAnimator";
import { getKeycapGeometry, keycapMetrics, rowProfile, topSurfaceY } from "../lib/keycapGeometry";
import { createCapMaterial, createLegendMaterial } from "../lib/palette";
import { taperedRoundedBox } from "../lib/shapes";
import { LEGEND_FONT } from "./Keycap";

type SwitchSpec = Extract<ModelSpec, { kind: "switch" }>;

const BOTTOM_H = 5;
const TOP_H = 6.6;
const STEM_ABOVE = 3.6;

function createSwitchGeometries(clicky: boolean) {
  const bottom = taperedRoundedBox(15.6, BOTTOM_H, 15.6, 0.55, [0.99, 0.99]);
  const top = taperedRoundedBox(15.2, TOP_H, 15.2, 1.6, [0.74, 0.72], 5);
  top.translate(0, BOTTOM_H - 0.02, 0);
  const crossA = new BoxGeometry(4.1, STEM_ABOVE + 0.6, 1.25);
  const crossB = new BoxGeometry(1.25, STEM_ABOVE + 0.6, 4.1);
  crossA.translate(0, BOTTOM_H + TOP_H + (STEM_ABOVE + 0.6) / 2 - 0.6, 0);
  crossB.translate(0, BOTTOM_H + TOP_H + (STEM_ABOVE + 0.6) / 2 - 0.6, 0);
  // Stem slider lives inside the top housing; the cross pokes out of the top.
  const stemBody = taperedRoundedBox(6.4, 4.0, 4.8, 0.55, [0.8, 0.88]);
  stemBody.translate(0, BOTTOM_H + 1.0, 0);
  const stemCollar = taperedRoundedBox(4.9, 1.6, 4.9, 0.4);
  stemCollar.translate(0, BOTTOM_H + 4.9, 0);
  const pole = new CylinderGeometry(1.25, 1.25, 4.4, 24);
  pole.translate(0, BOTTOM_H - 1.1, 0);
  // Spring: helix around the pole, mostly in the bottom housing.
  const turns = 7;
  const pts: Vector3[] = [];
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    pts.push(new Vector3(Math.cos(a) * 2.35, 0.7 + t * 5.6, Math.sin(a) * 2.35));
  }
  const spring = new TubeGeometry(new CatmullRomCurve3(pts), 800, 0.22, 8, false);
  // Contact leaf, visible through the housing.
  const leaf = new BoxGeometry(0.3, 5.2, 3.6);
  leaf.translate(-5.4, BOTTOM_H + 0.2, 1.4);
  const leafB = new BoxGeometry(0.3, 3.6, 2.8);
  leafB.translate(-4.5, BOTTOM_H - 0.4, 1.5);
  // Pins below the housing.
  const centerPole = new CylinderGeometry(1.95, 1.95, 3.3, 32);
  centerPole.translate(0, -1.65, 0);
  const pinA = new CylinderGeometry(0.72, 0.72, 3.3, 16);
  pinA.translate(-3.81, -1.65, 2.54);
  const pinB = new CylinderGeometry(0.72, 0.72, 3.3, 16);
  pinB.translate(2.54, -1.65, 5.08);
  const legA = new CylinderGeometry(0.85, 0.85, 3.3, 16);
  legA.translate(-5.08, -1.65, 0);
  const legB = new CylinderGeometry(0.85, 0.85, 3.3, 16);
  legB.translate(5.08, -1.65, 0);
  const clickBar = clicky ? new BoxGeometry(9.6, 0.5, 0.5) : null;
  clickBar?.translate(0, BOTTOM_H + 3.2, 3.6);
  return {
    bottom,
    top,
    crossA,
    crossB,
    stemBody,
    stemCollar,
    pole,
    spring,
    leaf,
    leafB,
    centerPole,
    pins: [pinA, pinB],
    legs: [legA, legB],
    clickBar,
  };
}

interface SwitchModelProps {
  spec: SwitchSpec;
  onReady?: () => void;
  /** When set, the stem (and optional keycap) follow the "switch" key of this animator. */
  animator?: KeyAnimator;
  keycap?: { color: string; legend: string; legendColor: string };
  scale?: number;
  /** Yaw of the switch; the default shows a front corner to the stage camera (classic 3/4 product view). */
  rotationY?: number;
}

export function SwitchModel({ spec, onReady, animator, keycap, scale = 0.105, rotationY = 0.26 }: SwitchModelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const geos = useMemo(() => createSwitchGeometries(spec.switchType === "clicky"), [spec.switchType]);
  const [mats] = useState(() => ({
    top: new MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.42,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      depthWrite: false,
      side: DoubleSide,
    }),
    bottom: new MeshPhysicalMaterial({ roughness: 0.46, sheen: 0.3, sheenRoughness: 0.6, sheenColor: new Color("#ffffff") }),
    stem: new MeshPhysicalMaterial({ roughness: 0.32, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
    gold: new MeshStandardMaterial({ color: "#e2b86a", metalness: 1, roughness: 0.28 }),
    steel: new MeshStandardMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.25 }),
    cap: createCapMaterial(),
    legend: createLegendMaterial(),
  }));

  useEffect(() => {
    mats.top.color.set(spec.top);
    mats.bottom.color.set(spec.bottom);
    mats.stem.color.set(spec.stem);
    if (keycap) {
      mats.cap.color.set(keycap.color);
      mats.legend.color.set(keycap.legendColor);
    }
    invalidate();
  }, [spec, keycap, mats, invalidate]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );

  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => {
        if (Array.isArray(g)) g.forEach((x) => x.dispose());
        else g?.dispose();
      });
    },
    [geos],
  );

  const stemRef = useRef<Group>(null);
  const capGeo = keycap ? getKeycapGeometry(1, 1, "cherry", 3) : null;
  const capMetrics = keycapMetrics(1, 1, rowProfile("cherry", 3));

  useEffect(() => {
    if (!animator) return;
    animator.register("switch", stemRef.current, 0);
    const unlisten = animator.listen(() => invalidate());
    return () => {
      animator.register("switch", null, 0);
      unlisten();
    };
  }, [animator, invalidate]);

  useFrame((_, dt) => {
    if (animator && animator.step(dt)) invalidate();
  });

  const readyRef = useRef(false);
  const handleReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady?.();
  };

  useEffect(() => {
    if (keycap) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(handleReady));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lift = 3.6;
  const capGap = 2.5;

  return (
    <group scale={scale} position={[0, lift * scale, 0]} rotation={[0, rotationY, 0]}>
      {/* static parts */}
      <mesh geometry={geos.bottom} material={mats.bottom} castShadow receiveShadow />
      <mesh geometry={geos.centerPole} material={mats.bottom} castShadow />
      {geos.pins.map((g, i) => (
        <mesh key={`p${i}`} geometry={g} material={mats.gold} castShadow />
      ))}
      {geos.legs.map((g, i) => (
        <mesh key={`l${i}`} geometry={g} material={mats.bottom} castShadow />
      ))}
      <mesh geometry={geos.leaf} material={mats.gold} />
      <mesh geometry={geos.leafB} material={mats.gold} />
      {geos.clickBar ? <mesh geometry={geos.clickBar} material={mats.steel} /> : null}
      <mesh geometry={geos.spring} material={spec.switchType === "linear" ? mats.gold : mats.steel} />
      {/* moving stem (+ keycap) */}
      <group ref={stemRef}>
        <mesh geometry={geos.pole} material={mats.stem} />
        <mesh geometry={geos.stemBody} material={mats.stem} castShadow />
        <mesh geometry={geos.stemCollar} material={mats.stem} />
        <mesh geometry={geos.crossA} material={mats.stem} castShadow />
        <mesh geometry={geos.crossB} material={mats.stem} castShadow />
        {keycap && capGeo ? (
          <group position={[0, BOTTOM_H + TOP_H + STEM_ABOVE + capGap, 0]}>
            <mesh geometry={capGeo} material={mats.cap} castShadow receiveShadow />
            <Text
              font={LEGEND_FONT}
              characters={keycap.legend}
              fontSize={5.2}
              anchorX="center"
              anchorY="middle"
              position={[0, topSurfaceY(capMetrics, 0, capMetrics.zShift) + 0.06, capMetrics.zShift]}
              rotation={[-Math.PI / 2 + capMetrics.tilt, 0, 0]}
              {...{ curveRadius: capMetrics.dishRadius }}
              glyphGeometryDetail={4}
              material={mats.legend}
              onSync={handleReady}
            >
              {keycap.legend}
            </Text>
          </group>
        ) : null}
      </group>
      {/* transparent top housing last */}
      <mesh geometry={geos.top} material={mats.top} renderOrder={2} />
    </group>
  );
}
