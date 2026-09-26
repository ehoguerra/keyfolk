"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
} from "three";
import type { ModelSpec } from "@/data/products";
import { drawDeskmat, ensureCanvasFonts } from "../lib/deskmatTexture";

type DeskmatSpec = Extract<ModelSpec, { kind: "deskmat" }>;

const MAT_W = 900;
const MAT_D = 400;
const THICK = 4;
const CORNER = 14;
const ROLL_LENGTH = 250;
const ROLL_R = 26;

/** A 900 × 400 × 4 mm mat, partly rolled at the right end (print inside, rubber outside). */
function createMatGeometry() {
  const geo = new BoxGeometry(MAT_W, THICK, MAT_D, 360, 1, 80);
  const pos = geo.attributes.position;
  const hx = MAT_W / 2;
  const hz = MAT_D / 2;
  const x0 = hx - ROLL_LENGTH;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const h = pos.getY(i) + THICK / 2;
    let z = pos.getZ(i);
    // rounded corners
    const cx = Math.max(-(hx - CORNER), Math.min(hx - CORNER, x));
    const cz = Math.max(-(hz - CORNER), Math.min(hz - CORNER, z));
    const dx = x - cx;
    const dz = z - cz;
    const len = Math.hypot(dx, dz);
    if (len > CORNER) {
      x = cx + (dx / len) * CORNER;
      z = cz + (dz / len) * CORNER;
    }
    let y = h;
    if (x > x0) {
      // Archimedean spiral: each turn the radius shrinks by one mat thickness.
      const s = x - x0;
      const k = THICK / (2 * Math.PI);
      const theta = (ROLL_R - Math.sqrt(Math.max(0, ROLL_R * ROLL_R - 2 * k * s))) / k;
      const rb = ROLL_R - k * theta;
      const r = rb - h;
      x = x0 + r * Math.sin(theta);
      y = ROLL_R - r * Math.cos(theta);
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function DeskmatModel({ spec, onReady }: { spec: DeskmatSpec; onReady?: () => void }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const geometry = useMemo(() => createMatGeometry(), []);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tex: CanvasTexture | null = null;
    ensureCanvasFonts().then(() => {
      if (cancelled) return;
      tex = new CanvasTexture(drawDeskmat(spec.pattern, spec.base, spec.ink, spec.accent));
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = gl.capabilities.getMaxAnisotropy();
      setTexture(tex);
    });
    return () => {
      cancelled = true;
      tex?.dispose();
    };
  }, [spec, gl]);

  const materials = useMemo(() => {
    const edge = new MeshStandardMaterial({
      color: new Color(spec.base).lerp(new Color("#1a1a1f"), 0.35),
      roughness: 0.9,
    });
    const top = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.86 });
    if (texture) top.map = texture;
    const rubber = new MeshStandardMaterial({ color: "#1f1f22", roughness: 0.95 });
    return [edge, edge, top, rubber, edge, edge];
  }, [spec.base, texture]);

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    if (!texture) return;
    invalidate();
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => cancelAnimationFrame(id);
  }, [texture, invalidate, onReady]);

  return (
    <group scale={0.0043} position={[0.02, 0, 0.1]} rotation={[0, 0.22, 0]}>
      <mesh geometry={geometry} material={materials} castShadow receiveShadow position={[0, 0, 0]} />
    </group>
  );
}
