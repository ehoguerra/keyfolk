import type { ModelSpec } from "@/data/products";

export type Vec3 = [number, number, number];

export interface StageConfig {
  fov: number;
  position: Vec3;
  target: Vec3;
  minDistance: number;
  maxDistance: number;
  shadowSize: number;
  contact: { scale: number; opacity?: number; blur?: number; far?: number };
}

/** Hero framing. The poster renders use the exact same values (and aspect ratio). */
export const HERO_ASPECT = 2.5;

export const HERO_STAGE: StageConfig = {
  fov: 21,
  position: [0, 3.32, 3.57],
  target: [0, 0.27, 0.12],
  minDistance: 3,
  maxDistance: 8,
  shadowSize: 2.3,
  contact: { scale: 6, opacity: 0.85, blur: 1.9, far: 0.32 },
};

/** Distance along a normalized direction. */
function along(dir: Vec3, dist: number, target: Vec3 = [0, 0, 0]): Vec3 {
  const len = Math.hypot(...dir);
  return [target[0] + (dir[0] / len) * dist, target[1] + (dir[1] / len) * dist, target[2] + (dir[2] / len) * dist];
}

/** Square product stage (1:1) per model kind. `size` is the model's largest horizontal extent (world units). */
export function productStage(spec: ModelSpec, size = 3.3): StageConfig {
  switch (spec.kind) {
    case "keyboard": {
      const dist = 2.3 * size + 0.55;
      return {
        fov: 26,
        position: along([-0.42, 0.7, 0.74], dist, [-0.06, 0.08, 0.06]),
        target: [-0.06, 0.08, 0.06],
        minDistance: dist * 0.6,
        maxDistance: dist * 1.35,
        shadowSize: size * 0.75,
        contact: { scale: size * 2, opacity: 0.5, blur: 2.4, far: 1.2 },
      };
    }
    case "keycaps":
      return {
        fov: 26,
        position: along([-0.35, 0.8, 0.72], 7.6, [0, 0.02, 0.04]),
        target: [0, 0.02, 0.04],
        minDistance: 3.6,
        maxDistance: 8,
        shadowSize: 1.9,
        contact: { scale: 6, opacity: 0.55, blur: 2, far: 0.8 },
      };
    case "switch":
      return {
        fov: 26,
        position: along([-0.5, 0.72, 0.85], 8.6, [0, 0.85, 0]),
        target: [0, 0.85, 0],
        minDistance: 3.8,
        maxDistance: 9,
        shadowSize: 2,
        contact: { scale: 6, opacity: 0.6, blur: 2.2, far: 1.6 },
      };
    case "deskmat":
      return {
        fov: 26,
        position: along([-0.3, 0.9, 0.62], 10, [-0.5, -0.22, 0.25]),
        target: [-0.5, -0.22, 0.25],
        minDistance: 4.5,
        maxDistance: 10,
        shadowSize: 2.8,
        contact: { scale: 8, opacity: 0.45, blur: 2.4, far: 0.6 },
      };
    case "cable":
      return {
        fov: 26,
        position: along([-0.2, 0.92, 0.58], 10.2, [0, 0, 0.05]),
        target: [0, 0.05, 0.05],
        minDistance: 4,
        maxDistance: 11,
        shadowSize: 2.4,
        contact: { scale: 7, opacity: 0.55, blur: 2, far: 0.8 },
      };
  }
}

/** Sound lab: a switch with an exploded keycap above it (square stage). */
export const LAB_STAGE: StageConfig = {
  fov: 26,
  position: along([-0.5, 0.56, 0.85], 9.6, [0, 1.3, 0]),
  target: [0, 1.3, 0],
  minDistance: 6,
  maxDistance: 12,
  shadowSize: 2.2,
  contact: { scale: 6, opacity: 0.55, blur: 2.4, far: 2 },
};

export const LAB_KEYCAP = { color: "#F4F2EC", legend: "K", legendColor: "#23242A" };
