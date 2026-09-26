import { ExtrudeGeometry, Path, Shape, type BufferGeometry } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

/** Rounded rectangle centered at (cx, cy) in shape space. */
function roundedRect<T extends Path>(p: T, w: number, h: number, r: number, cx = 0, cy = 0): T {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const x1 = cx + w / 2;
  const y1 = cy + h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  p.moveTo(x0 + rr, y0);
  p.lineTo(x1 - rr, y0);
  p.absarc(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0, false);
  p.lineTo(x1, y1 - rr);
  p.absarc(x1 - rr, y1 - rr, rr, 0, Math.PI / 2, false);
  p.lineTo(x0 + rr, y1);
  p.absarc(x0 + rr, y1 - rr, rr, Math.PI / 2, Math.PI, false);
  p.lineTo(x0, y0 + rr);
  p.absarc(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5, false);
  return p;
}

export interface SlabOptions {
  width: number;
  depth: number;
  radius: number;
  /** Height at world z = 0 (center), measured from `base`. */
  height: number;
  base?: number;
  /** Slope of the top face: height grows by `slope` mm per mm toward -z (the back). */
  slope?: number;
  bevel?: number;
  bevelSegments?: number;
  hole?: { width: number; depth: number; radius: number; offsetZ?: number };
}

/**
 * Extruded rounded slab lying on the XZ plane, optionally with a hole (the keyboard "well")
 * and a sloped top (the typing angle). All values in millimetres.
 */
export function createSlabGeometry(o: SlabOptions): BufferGeometry {
  const bevel = o.bevel ?? 1.2;
  const base = o.base ?? 0;
  const slope = o.slope ?? 0;
  const shape = roundedRect(new Shape(), o.width - bevel * 2, o.depth - bevel * 2, Math.max(0.5, o.radius - bevel));
  if (o.hole) {
    // Shape space y maps to world -z after the rotation below.
    const hole = roundedRect(
      new Path(),
      o.hole.width + bevel * 2,
      o.hole.depth + bevel * 2,
      o.hole.radius + bevel,
      0,
      -(o.hole.offsetZ ?? 0),
    );
    shape.holes.push(hole);
  }
  const inner = Math.max(0.1, o.height - bevel * 2);
  const geo = new ExtrudeGeometry(shape, {
    depth: inner,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: o.bevelSegments ?? 4,
    curveSegments: 20,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);

  // Wedge: scale heights so the top follows the typing angle while the bottom stays flat.
  if (slope !== 0) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const h = o.height - z * slope;
      pos.setY(i, (y * h) / o.height);
    }
  }
  geo.translate(0, base, 0);

  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  const merged = mergeVertices(geo, 1e-3);
  merged.computeVertexNormals();
  geo.dispose();
  return merged;
}
