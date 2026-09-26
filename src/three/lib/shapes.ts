import { BoxGeometry, LatheGeometry, Vector2, type BufferGeometry } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Tapered rounded box (mm): a rounded box whose top face is scaled by `topScale`.
 * Base at y = 0.
 */
export function taperedRoundedBox(
  w: number,
  h: number,
  d: number,
  r: number,
  topScale: [number, number] = [1, 1],
  segments = 4,
): BufferGeometry {
  const f = 2;
  const n = 2 * segments + f;
  const box = new BoxGeometry(1, 1, 1, n, n, n);
  box.deleteAttribute("normal");
  box.deleteAttribute("uv");
  const pos = box.attributes.position;
  const remap = (u: number, half: number) => {
    const i = Math.round((u + 0.5) * n);
    if (i <= segments) return -half + (i / segments) * r;
    if (i >= segments + f) return half - r + ((i - segments - f) / segments) * r;
    return -half + r + ((i - segments) / f) * (2 * half - 2 * r);
  };
  const hx = w / 2;
  const hy = h / 2;
  const hz = d / 2;
  for (let i = 0; i < pos.count; i++) {
    let x = remap(pos.getX(i), hx);
    let y = remap(pos.getY(i), hy);
    let z = remap(pos.getZ(i), hz);
    const cx = Math.max(-(hx - r), Math.min(hx - r, x));
    const cy = Math.max(-(hy - r), Math.min(hy - r, y));
    const cz = Math.max(-(hz - r), Math.min(hz - r, z));
    const dx = x - cx;
    const dy = y - cy;
    const dz = z - cz;
    const len = Math.hypot(dx, dy, dz);
    if (len > 1e-6) {
      x = cx + (dx / len) * r;
      y = cy + (dy / len) * r;
      z = cz + (dz / len) * r;
    }
    const t = (y + hy) / (2 * hy);
    x *= 1 + t * (topScale[0] - 1);
    z *= 1 + t * (topScale[1] - 1);
    pos.setXYZ(i, x, y + hy, z);
  }
  const geo = mergeVertices(box, 1e-4);
  geo.computeVertexNormals();
  box.dispose();
  return geo;
}

/** Cylinder with a diamond-knurled band (mm), base at y = 0, axis along +y. */
export function knurledCylinder(
  radius: number,
  height: number,
  opts: { ridges?: number; depth?: number; band?: [number, number]; chamfer?: number; segments?: number } = {},
): BufferGeometry {
  const ridges = opts.ridges ?? 40;
  const depth = opts.depth ?? 0.3;
  const [b0, b1] = opts.band ?? [height * 0.12, height * 0.88];
  const ch = opts.chamfer ?? Math.min(0.8, radius * 0.1);
  const pts: Vector2[] = [new Vector2(0.01, 0), new Vector2(radius - ch, 0), new Vector2(radius, ch)];
  const steps = Math.max(12, Math.round(((b1 - b0) / ((2 * Math.PI * radius) / ridges)) * 5));
  if (b0 > ch + 0.01) pts.push(new Vector2(radius, b0));
  for (let i = 0; i <= steps; i++) pts.push(new Vector2(radius, b0 + ((b1 - b0) * i) / steps));
  if (b1 < height - ch - 0.01) pts.push(new Vector2(radius, height - ch));
  pts.push(new Vector2(radius - ch, height), new Vector2(0.01, height));
  const geo = new LatheGeometry(pts, opts.segments ?? Math.max(96, ridges * 6));
  geo.deleteAttribute("uv");
  geo.deleteAttribute("normal");
  const pos = geo.attributes.position;
  const pitch = (2 * Math.PI * radius) / ridges;
  const tri = (t: number) => 1 - 2 * Math.abs(t - Math.floor(t) - 0.5);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y < b0 - 1e-3 || y > b1 + 1e-3) continue;
    const r = Math.hypot(x, z);
    if (r < radius - 0.01) continue;
    const u = (Math.atan2(z, x) / (2 * Math.PI)) * ridges;
    const v = (y - b0) / pitch;
    const hgt = Math.min(tri(u + v), tri(u - v));
    const edge = Math.min(1, (y - b0) / (pitch * 0.5), (b1 - y) / (pitch * 0.5));
    const nr = radius - depth * (1 - hgt) * Math.max(0, edge);
    pos.setX(i, (x / r) * nr);
    pos.setZ(i, (z / r) * nr);
  }
  const merged = mergeVertices(geo, 1e-4);
  merged.computeVertexNormals();
  geo.dispose();
  return merged;
}

/** Plain lathe from a radius/height profile (mm). */
export function lathe(profile: Array<[number, number]>, segments = 64): BufferGeometry {
  const geo = new LatheGeometry(
    profile.map(([r, y]) => new Vector2(Math.max(0.01, r), y)),
    segments,
  );
  geo.deleteAttribute("uv");
  geo.deleteAttribute("normal");
  const merged = mergeVertices(geo, 1e-4);
  merged.computeVertexNormals();
  geo.dispose();
  return merged;
}
