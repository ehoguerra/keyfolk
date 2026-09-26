"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BoxGeometry, InstancedMesh, Object3D, type Material } from "three";
import { createSlabGeometry } from "../lib/caseGeometry";
import { PITCH } from "../lib/keycapGeometry";
import type { KeyAnimator } from "../lib/keyAnimator";
import { layoutCharacters, type KeyboardLayout, type KeyDef } from "../lib/layouts";
import {
  applyPalette,
  createKeyboardMaterials,
  disposeMaterials,
  stepPalette,
  type KeyboardMaterials,
  type KeyboardPalette,
} from "../lib/palette";
import { Keycap } from "./Keycap";
import { Knob } from "./Knob";

const LOGO_FONT = "/fonts/archivo-expanded-extrabold.ttf";

/** Height of the key bottoms above the plate (switch top housing + clearance), mm. */
const KEY_REST = 5.4;
/** Case wall above the plate: hides the switches, shows the caps. */
const WALL_ABOVE_PLATE = 6.4;
const LIP_HEIGHT = 3.6;

export interface KeyboardDims {
  outerW: number;
  outerD: number;
  heightFront: number;
  heightBack: number;
  tilt: number;
}

export function keyboardDims(layout: KeyboardLayout, withCase: boolean): KeyboardDims {
  const keyW = layout.width * PITCH;
  const keyD = layout.depth * PITCH;
  if (!withCase) return { outerW: keyW, outerD: keyD, heightFront: 0, heightBack: 0, tilt: 0 };
  const compact = layout.id === "40-orto";
  const bezelSide = compact ? 8.5 : 10.5;
  const bezelFront = compact ? 9 : 11.5;
  const bezelBack = compact ? 9.5 : 12.5;
  const outerW = keyW + 2.4 + bezelSide * 2;
  const outerD = keyD + 2.4 + bezelFront + bezelBack;
  const heightFront = compact ? 15 : 19;
  const heightBack = compact ? 22 : 31;
  return { outerW, outerD, heightFront, heightBack, tilt: Math.atan((heightBack - heightFront) / outerD) };
}

interface KeyboardModelProps {
  layout: KeyboardLayout;
  palette: KeyboardPalette;
  /** Ease colors toward new palettes instead of snapping. */
  animatePalette?: boolean;
  withCase?: boolean;
  animator?: KeyAnimator;
  /** Called when a key is pressed with the pointer. */
  onKeyPointerDown?: (code: string) => void;
  onReady?: () => void;
}

export function KeyboardModel({
  layout,
  palette,
  animatePalette = false,
  withCase = true,
  animator,
  onKeyPointerDown,
  onReady,
}: KeyboardModelProps) {
  const invalidate = useThree((s) => s.invalidate);
  const [mats] = useState<KeyboardMaterials>(() => {
    const m = createKeyboardMaterials();
    applyPalette(m, palette);
    return m;
  });
  const paletteRef = useRef(palette);
  const animating = useRef(false);

  useEffect(() => () => disposeMaterials({ ...mats }), [mats]);

  useEffect(() => {
    paletteRef.current = palette;
    if (animatePalette) {
      animating.current = true;
    } else {
      applyPalette(mats, palette);
    }
    invalidate();
  }, [palette, animatePalette, mats, invalidate]);

  useFrame((_, dt) => {
    let active = false;
    if (animating.current) {
      animating.current = stepPalette(mats, paletteRef.current, dt);
      active ||= animating.current;
    }
    if (animator) active = animator.step(dt) || active;
    if (active) invalidate();
  });

  useEffect(() => animator?.listen(() => invalidate()), [animator, invalidate]);

  const dims = keyboardDims(layout, withCase);
  const characters = useMemo(() => layoutCharacters(layout), [layout]);
  const keyW = layout.width * PITCH;
  const keyD = layout.depth * PITCH;

  // Case geometry
  const caseParts = useMemo(() => {
    if (!withCase) return null;
    const slope = Math.tan(dims.tilt);
    const heightCenter = (dims.heightFront + dims.heightBack) / 2;
    const offsetZ = layoutBezelDelta(layout) / 2;
    const body = createSlabGeometry({
      width: dims.outerW,
      depth: dims.outerD,
      radius: 8,
      base: LIP_HEIGHT,
      height: heightCenter - LIP_HEIGHT,
      slope,
      bevel: 1.5,
      bevelSegments: 5,
      hole: { width: keyW + 2.4, depth: keyD + 2.4, radius: 2.6, offsetZ },
    });
    const lip = createSlabGeometry({
      width: dims.outerW - 2.6,
      depth: dims.outerD - 2.6,
      radius: 6.8,
      height: LIP_HEIGHT + 0.6,
      bevel: 0.7,
      bevelSegments: 3,
    });
    const plate = new BoxGeometry(keyW + 1.6, 1.6, keyD + 1.6);
    plate.translate(0, -0.8, 0);
    return { body, lip, plate, heightCenter, offsetZ };
  }, [withCase, dims.tilt, dims.heightFront, dims.heightBack, dims.outerW, dims.outerD, keyW, keyD, layout]);

  useEffect(
    () => () => {
      caseParts?.body.dispose();
      caseParts?.lip.dispose();
      caseParts?.plate.dispose();
    },
    [caseParts],
  );

  // Legends readiness (troika syncs asynchronously)
  const legendCount = layout.keys.filter((k) => k.style !== "none").length + (withCase ? 1 : 0);
  const synced = useRef(new Set<string>());
  const readyFired = useRef(false);
  const handleSync = (id: string) => {
    synced.current.add(id);
    if (!readyFired.current && synced.current.size >= legendCount) {
      readyFired.current = true;
      invalidate();
      onReady?.();
    }
  };

  const plateY = withCase && caseParts ? caseParts.heightCenter - WALL_ABOVE_PLATE : 0;
  const keyRest = withCase ? KEY_REST : 0;
  const offsetZ = caseParts?.offsetZ ?? 0;

  const keyPosition = (k: KeyDef): [number, number, number] => [
    (k.x + k.w / 2) * PITCH - keyW / 2,
    keyRest,
    (k.y + k.h / 2) * PITCH - keyD / 2,
  ];

  const handlePointerDown = (code: string) => (e: ThreeEvent<PointerEvent>) => {
    if (!onKeyPointerDown) return;
    e.stopPropagation();
    onKeyPointerDown(code);
  };

  const registerNode = animator
    ? (code: string, node: Object3D | null) => animator.register(code, node, keyRest)
    : undefined;

  const keys = layout.keys.map((k) => (
    <Keycap
      key={k.code + k.x + k.y}
      def={k}
      profile={layout.profile}
      capMaterial={mats[k.role]}
      legendMaterial={mats[`${k.role}Legend`]}
      characters={characters}
      position={keyPosition(k)}
      registerNode={registerNode}
      onPointerDown={onKeyPointerDown ? handlePointerDown(k.code) : undefined}
      onLegendSync={handleSync}
    />
  ));

  if (!withCase || !caseParts) {
    return <group>{keys}</group>;
  }

  return (
    <group>
      <mesh geometry={caseParts.body} material={mats.case} castShadow receiveShadow />
      <mesh geometry={caseParts.lip} material={mats.lip} castShadow receiveShadow />
      {/* Everything mounted on the plate follows the typing angle. */}
      <group position={[0, plateY, offsetZ]} rotation={[dims.tilt, 0, 0]}>
        <mesh geometry={caseParts.plate} material={mats.plate} receiveShadow />
        <SwitchHousings layout={layout} keyW={keyW} keyD={keyD} material={mats.housing} />
        {keys}
        {layout.knob ? (
          <group position={[(layout.knob.x + 0.5) * PITCH - keyW / 2, 0, (layout.knob.y + 0.5) * PITCH - keyD / 2]}>
            <Knob material={mats.knob} markerMaterial={mats.lip} />
          </group>
        ) : null}
        <Text
          font={LOGO_FONT}
          characters="keyfolk"
          fontSize={2.5}
          letterSpacing={0.06}
          anchorX="center"
          anchorY="middle"
          position={[0, WALL_ABOVE_PLATE + 0.06, keyD / 2 + 1.2 + frontBezelCenter(layout)]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={mats.engraving}
          onSync={() => handleSync("__logo")}
        >
          keyfolk
        </Text>
      </group>
    </group>
  );
}

function layoutBezelDelta(layout: KeyboardLayout): number {
  // back bezel is 1 mm deeper than the front one: shift the well toward the typist
  return layout.id === "40-orto" ? 0.5 : 1;
}

function frontBezelCenter(layout: KeyboardLayout): number {
  return layout.id === "40-orto" ? 4.2 : 5.4;
}

function SwitchHousings({
  layout,
  keyW,
  keyD,
  material,
}: {
  layout: KeyboardLayout;
  keyW: number;
  keyD: number;
  material: Material;
}) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new BoxGeometry(14.2, 5, 14.2);
    g.translate(0, 2.5, 0);
    return g;
  }, []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    layout.keys.forEach((k, i) => {
      o.position.set((k.x + k.w / 2) * PITCH - keyW / 2, 0, (k.y + k.h / 2) * PITCH - keyD / 2);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [layout, keyW, keyD]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <instancedMesh ref={ref} args={[geometry, material, layout.keys.length]} receiveShadow />;
}
