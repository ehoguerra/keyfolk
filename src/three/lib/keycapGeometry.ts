import { BoxGeometry, type BufferGeometry } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/** Distance between key centers (mm). */
export const PITCH = 19.05;
/** Gap between neighbouring keycaps at the base (mm): 1u cap ≈ 18 mm wide. */
const BASE_GAP = 1.05;
/** Keycap wall taper from base to top (mm): 1u top ≈ 12.5 × 13.7 mm. */
const TAPER_X = 5.6;
const TAPER_Z = 4.4;
/** Edge rounding (mm). */
const RADIUS = 1.25;
/** Top face sits slightly toward the back, like Cherry profile caps. */
const TOP_SHIFT_Z = -0.55;

export interface RowProfile {
  /** Total height of the cap at the center of its top face (mm). */
  height: number;
  /** Top face tilt in degrees; positive faces the typist. */
  tilt: number;
}

export type ProfileId = "cherry" | "uniform";

/**
 * Sculpted Cherry-like profile. Index = profile row:
 * 0 F-row, 1 number row, 2 top alpha, 3 home, 4 shift, 5 bottom.
 */
const PROFILES: Record<ProfileId, RowProfile[]> = {
  cherry: [
    { height: 10.6, tilt: 8.5 },
    { height: 9.8, tilt: 7 },
    { height: 8.7, tilt: 3 },
    { height: 8.2, tilt: -1 },
    { height: 8.8, tilt: -6.5 },
    { height: 8.8, tilt: -6.5 },
  ],
  uniform: Array.from({ length: 6 }, () => ({ height: 8.4, tilt: 0 })),
};

export function rowProfile(profile: ProfileId, row: number): RowProfile {
  const rows = PROFILES[profile];
  return rows[Math.max(0, Math.min(rows.length - 1, row))];
}

export interface KeycapMetrics {
  bottomW: number;
  bottomD: number;
  topW: number;
  topD: number;
  height: number;
  tilt: number;
  zShift: number;
  dishDepth: number;
  /** Radius of the cylindrical dish (used to curve the legends). */
  dishRadius: number;
}

export function keycapMetrics(widthU: number, depthU: number, row: RowProfile): KeycapMetrics {
  const bottomW = widthU * PITCH - BASE_GAP;
  const bottomD = depthU * PITCH - BASE_GAP;
  const topW = bottomW - TAPER_X;
  const topD = bottomD - TAPER_Z;
  // Wide keys (space, shifts) get a much shallower dish so they don't look scooped.
  const dishDepth = 0.62 * Math.min(1, 1.35 / widthU);
  const hw = topW / 2;
  return {
    bottomW,
    bottomD,
    topW,
    topD,
    height: row.height,
    tilt: (row.tilt * Math.PI) / 180,
    zShift: TOP_SHIFT_Z,
    dishDepth,
    dishRadius: (hw * hw) / (2 * dishDepth),
  };
}

/** Height of the top surface at local (x, z), with the base of the cap at y = 0. */
export function topSurfaceY(m: KeycapMetrics, x: number, z: number): number {
  const xn = x / (m.topW / 2);
  return m.height - (z - m.zShift) * Math.tan(m.tilt) - m.dishDepth * Math.max(0, 1 - xn * xn);
}

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Map a unit-box grid coordinate to a rounded-box coordinate with dense samples near the edges. */
function remap(u: number, half: number, r: number, s: number, f: number): number {
  const n = 2 * s + f;
  const i = Math.round((u + 0.5) * n);
  if (i <= s) return -half + (i / s) * r;
  if (i >= s + f) return half - r + ((i - s - f) / s) * r;
  return -half + r + ((i - s) / f) * (2 * half - 2 * r);
}

const cache = new Map<string, BufferGeometry>();

/**
 * Builds a sculpted keycap: rounded box → tapered walls → tilted top → cylindrical dish.
 * Geometry is in millimetres with the base at y = 0, centered on x/z. Cached per shape.
 */
export function getKeycapGeometry(widthU: number, depthU: number, profile: ProfileId, row: number): BufferGeometry {
  const key = `${profile}:${row}:${widthU}:${depthU}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const m = keycapMetrics(widthU, depthU, rowProfile(profile, row));
  const s = 4; // segments inside each rounded edge
  const fx = Math.round(6 + widthU * 2);
  const fy = 4;
  const fz = Math.round(6 + depthU * 2);
  const box = new BoxGeometry(1, 1, 1, 2 * s + fx, 2 * s + fy, 2 * s + fz);
  box.deleteAttribute("normal");
  box.deleteAttribute("uv");

  const pos = box.attributes.position;
  const hx = m.bottomW / 2;
  const hy = m.height / 2;
  const hz = m.bottomD / 2;
  const r = RADIUS;
  const ix = hx - r;
  const iy = hy - r;
  const iz = hz - r;
  const topHalfW = m.topW / 2;
  const tanTilt = Math.tan(m.tilt);

  for (let i = 0; i < pos.count; i++) {
    let x = remap(pos.getX(i), hx, r, s, fx);
    let y = remap(pos.getY(i), hy, r, s, fy);
    let z = remap(pos.getZ(i), hz, r, s, fz);

    // Rounded box projection.
    const cx = Math.max(-ix, Math.min(ix, x));
    const cy = Math.max(-iy, Math.min(iy, y));
    const cz = Math.max(-iz, Math.min(iz, z));
    const dx = x - cx;
    const dy = y - cy;
    const dz = z - cz;
    const len = Math.hypot(dx, dy, dz);
    if (len > 1e-6) {
      x = cx + (dx / len) * r;
      y = cy + (dy / len) * r;
      z = cz + (dz / len) * r;
    }

    // Taper the walls toward the top.
    const t = (y + hy) / (2 * hy);
    x *= 1 - (t * (m.bottomW - m.topW)) / m.bottomW;
    z *= 1 - (t * (m.bottomD - m.topD)) / m.bottomD;
    z += t * m.zShift;

    // Tilt the top around its center (sculpted rows).
    y += -(z - t * m.zShift) * tanTilt * t;

    // Cylindrical dish across the width; fades out down the skirt.
    const w = smoothstep(0.72, 1, t);
    const xn = x / topHalfW;
    y -= w * m.dishDepth * Math.max(0, 1 - xn * xn);

    pos.setXYZ(i, x, y + hy, z);
  }

  const geo = mergeVertices(box, 1e-4);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  box.dispose();
  cache.set(key, geo);
  return geo;
}
