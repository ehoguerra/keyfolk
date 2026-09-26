"use client";

import { useMemo } from "react";
import { LatheGeometry, Vector2, type Material } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const R = 8.6;
const H = 17;

/** Diamond-knurled aluminium knob (mm), base at y = 0. */
function createKnobGeometry() {
  const pts: Vector2[] = [];
  pts.push(new Vector2(0.01, 0));
  pts.push(new Vector2(R - 0.5, 0));
  pts.push(new Vector2(R, 0.5));
  // knurled band sampled densely so the diamonds can be displaced
  const bandStart = 1.4;
  const bandEnd = H - 3.2;
  const steps = 56;
  for (let i = 0; i <= steps; i++) pts.push(new Vector2(R, bandStart + ((bandEnd - bandStart) * i) / steps));
  pts.push(new Vector2(R, H - 1.4));
  pts.push(new Vector2(R - 0.35, H - 0.55));
  pts.push(new Vector2(R - 1.0, H - 0.12));
  pts.push(new Vector2(R - 1.6, H));
  pts.push(new Vector2(3.5, H - 0.25));
  pts.push(new Vector2(0.01, H - 0.32));

  const segments = 288;
  const geo = new LatheGeometry(pts, segments);
  geo.deleteAttribute("uv");
  geo.deleteAttribute("normal");
  const pos = geo.attributes.position;
  const ridges = 48;
  const pitchY = (2 * Math.PI * R) / ridges;
  const tri = (t: number) => 1 - 2 * Math.abs(t - Math.floor(t) - 0.5);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y < bandStart - 1e-3 || y > bandEnd + 1e-3) continue;
    const r = Math.hypot(x, z);
    if (r < R - 0.01) continue;
    const theta = Math.atan2(z, x);
    const u = (theta / (2 * Math.PI)) * ridges;
    const v = (y - bandStart) / pitchY;
    const h = Math.min(tri(u + v), tri(u - v));
    // fade the knurl in/out at the band edges
    const edge = Math.min(1, (y - bandStart) / 0.6, (bandEnd - y) / 0.6);
    const nr = R - 0.42 * (1 - h) * Math.max(0, edge);
    pos.setX(i, (x / r) * nr);
    pos.setZ(i, (z / r) * nr);
  }
  const merged = mergeVertices(geo, 1e-4);
  merged.computeVertexNormals();
  geo.dispose();
  return merged;
}

export function Knob({ material, markerMaterial }: { material: Material; markerMaterial: Material }) {
  const geometry = useMemo(() => createKnobGeometry(), []);
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {/* position marker */}
      <mesh position={[0, H + 0.02, -R + 3.2]} rotation={[-Math.PI / 2, 0, 0]} material={markerMaterial}>
        <circleGeometry args={[0.85, 24]} />
      </mesh>
    </group>
  );
}
