import { Color, MeshPhysicalMaterial, MeshStandardMaterial, type Material } from "three";
import { COLORWAYS, type Capset, type ColorwayId } from "@/lib/colorways";

export interface KeyboardPalette extends Capset {
  case: string;
  lip: string;
  plate: string;
  housing: string;
  engraving: string;
}

const isDark = (hex: string) => new Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l < 0.35;

function mix(a: string, b: string, t: number): string {
  return `#${new Color(a).lerp(new Color(b), t).getHexString()}`;
}

export function capsetOf(id: ColorwayId): Capset {
  const c = COLORWAYS[id];
  return {
    alpha: c.alpha,
    alphaLegend: c.alphaLegend,
    mod: c.mod,
    modLegend: c.modLegend,
    accent: c.accent,
    accentLegend: c.accentLegend,
  };
}

/** Palette for a keyboard: a case color dressed with a keycap set. */
export function keyboardPalette(caseHex: string, capset: ColorwayId): KeyboardPalette {
  const caps = capsetOf(capset);
  const dark = isDark(caseHex);
  return {
    ...caps,
    case: caseHex,
    lip: caps.accent,
    plate: mix(caseHex, "#15161a", dark ? 0.5 : 0.72),
    housing: dark ? "#2a2738" : mix(caseHex, "#2a2c31", 0.55),
    engraving: dark ? "#b9bcc4" : mix(caseHex, "#ffffff", 0.8),
  };
}

/** Hero palette: the site colorway drives both keycaps and case. */
export function colorwayPalette(id: ColorwayId): KeyboardPalette {
  return keyboardPalette(COLORWAYS[id].case, id);
}

export type PaletteKey = keyof KeyboardPalette;

export interface KeyboardMaterials {
  alpha: MeshPhysicalMaterial;
  mod: MeshPhysicalMaterial;
  accent: MeshPhysicalMaterial;
  alphaLegend: MeshStandardMaterial;
  modLegend: MeshStandardMaterial;
  accentLegend: MeshStandardMaterial;
  case: MeshPhysicalMaterial;
  lip: MeshPhysicalMaterial;
  plate: MeshStandardMaterial;
  housing: MeshPhysicalMaterial;
  engraving: MeshStandardMaterial;
  knob: MeshPhysicalMaterial;
}

/** PBT: matte, slightly satin, no metalness. */
export function createCapMaterial(color = "#ffffff"): MeshPhysicalMaterial {
  return new MeshPhysicalMaterial({
    color,
    roughness: 0.56,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.7,
    sheenColor: new Color("#ffffff"),
    specularIntensity: 0.55,
  });
}

export function createLegendMaterial(color = "#000000"): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });
}

export function createKeyboardMaterials(): KeyboardMaterials {
  return {
    alpha: createCapMaterial(),
    mod: createCapMaterial(),
    accent: createCapMaterial(),
    alphaLegend: createLegendMaterial(),
    modLegend: createLegendMaterial(),
    accentLegend: createLegendMaterial(),
    // Bead-blasted, anodized aluminium with a light protective clearcoat.
    case: new MeshPhysicalMaterial({
      metalness: 0.62,
      roughness: 0.34,
      clearcoat: 0.35,
      clearcoatRoughness: 0.22,
    }),
    lip: new MeshPhysicalMaterial({ metalness: 0.8, roughness: 0.24, clearcoat: 0.4, clearcoatRoughness: 0.15 }),
    plate: new MeshStandardMaterial({ roughness: 0.72, metalness: 0.15 }),
    housing: new MeshPhysicalMaterial({ roughness: 0.3, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
    engraving: new MeshStandardMaterial({ metalness: 0.85, roughness: 0.32 }),
    knob: new MeshPhysicalMaterial({
      color: "#d7d9dd",
      metalness: 1,
      roughness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
    }),
  };
}

const PALETTE_KEYS: PaletteKey[] = [
  "alpha",
  "alphaLegend",
  "mod",
  "modLegend",
  "accent",
  "accentLegend",
  "case",
  "lip",
  "plate",
  "housing",
  "engraving",
];

export function applyPalette(mats: KeyboardMaterials, palette: KeyboardPalette): void {
  for (const key of PALETTE_KEYS) mats[key].color.set(palette[key]);
}

const _target = new Color();

/**
 * Eases every material color toward the palette. Returns true while still animating.
 * `k` controls speed: ~5 settles in ≈600 ms.
 */
export function stepPalette(mats: KeyboardMaterials, palette: KeyboardPalette, dt: number, k = 5.5): boolean {
  const f = 1 - Math.exp(-k * dt);
  let moving = false;
  for (const key of PALETTE_KEYS) {
    const c = mats[key].color;
    _target.set(palette[key]);
    const d = Math.abs(c.r - _target.r) + Math.abs(c.g - _target.g) + Math.abs(c.b - _target.b);
    if (d < 0.0015) {
      c.copy(_target);
      continue;
    }
    c.lerp(_target, f);
    moving = true;
  }
  return moving;
}

export function disposeMaterials(mats: Record<string, Material>): void {
  for (const m of Object.values(mats)) m.dispose();
}
