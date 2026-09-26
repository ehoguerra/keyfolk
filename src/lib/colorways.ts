export const COLORWAY_IDS = ["mochi", "laguna", "sinal", "matcha", "noturno"] as const;

export type ColorwayId = (typeof COLORWAY_IDS)[number];

export const DEFAULT_COLORWAY: ColorwayId = "laguna";

/** Key colors used by the 3D keycaps. */
export interface Capset {
  alpha: string;
  alphaLegend: string;
  mod: string;
  modLegend: string;
  accent: string;
  accentLegend: string;
}

export interface Colorway extends Capset {
  id: ColorwayId;
  name: string;
  /** One-line description used in the picker tooltip / catalog. */
  mood: string;
  bg: string;
  surface: string;
  ink: string;
  /** Adjusted from the brief so it meets WCAG AA (≥4.5:1) on `bg`. */
  muted: string;
  case: string;
  /** UI-safe strong color for primary buttons, focus rings and links. */
  brand: string;
  onBrand: string;
  dark: boolean;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  mochi: {
    id: "mochi",
    name: "Mochi",
    mood: "Rosa de doceria com um toque de chá verde.",
    bg: "#F6E4E7",
    surface: "#FFF4F5",
    ink: "#3A1E2A",
    muted: "#7B5A65",
    alpha: "#FFF8F5",
    alphaLegend: "#3A1E2A",
    mod: "#E48CA6",
    modLegend: "#FFF8F5",
    accent: "#7DB47E",
    accentLegend: "#FFFFFF",
    case: "#F1D3DA",
    brand: "#A8365C",
    onBrand: "#FFF8F5",
    dark: false,
  },
  laguna: {
    id: "laguna",
    name: "Laguna",
    mood: "Água rasa, azul-petróleo e um sol de fim de tarde.",
    bg: "#D8ECEA",
    surface: "#F0FAF8",
    ink: "#0F3440",
    muted: "#49676E",
    alpha: "#F5FBFA",
    alphaLegend: "#0F3440",
    mod: "#1F6F78",
    modLegend: "#E7F6F3",
    accent: "#FFB703",
    accentLegend: "#0F3440",
    case: "#BCDAD8",
    brand: "#1F6F78",
    onBrand: "#F0FAF8",
    dark: false,
  },
  sinal: {
    id: "sinal",
    name: "Sinal",
    mood: "Cinza de prancheta com laranja de sinalização.",
    bg: "#E8E7E2",
    surface: "#F5F4F0",
    ink: "#1D1E21",
    muted: "#606266",
    alpha: "#F3F2EE",
    alphaLegend: "#1D1E21",
    mod: "#45484E",
    modLegend: "#F3F2EE",
    accent: "#FF5B22",
    accentLegend: "#FFFFFF",
    case: "#CFCEC8",
    brand: "#C2410C",
    onBrand: "#FFFFFF",
    dark: false,
  },
  matcha: {
    id: "matcha",
    name: "Matcha",
    mood: "Verde de chá batido, creme e mel.",
    bg: "#E3E9D4",
    surface: "#F4F6EC",
    ink: "#243018",
    muted: "#586647",
    alpha: "#FAF7EC",
    alphaLegend: "#243018",
    mod: "#6A8D4C",
    modLegend: "#FAF7EC",
    accent: "#E7B94C",
    accentLegend: "#243018",
    case: "#CDD6B8",
    brand: "#4A6A31",
    onBrand: "#FAF7EC",
    dark: false,
  },
  noturno: {
    id: "noturno",
    name: "Noturno",
    mood: "Madrugada roxa com brilho de monitor.",
    bg: "#16132A",
    surface: "#221E3D",
    ink: "#ECE8FF",
    muted: "#A59FCB",
    alpha: "#2B2650",
    alphaLegend: "#D9D2FF",
    mod: "#3D3573",
    modLegend: "#D9D2FF",
    accent: "#8BE0FF",
    accentLegend: "#16132A",
    case: "#0F0D1E",
    brand: "#8BE0FF",
    onBrand: "#16132A",
    dark: true,
  },
};

export const COLORWAY_LIST: Colorway[] = COLORWAY_IDS.map((id) => COLORWAYS[id]);

export function isColorwayId(value: unknown): value is ColorwayId {
  return typeof value === "string" && (COLORWAY_IDS as readonly string[]).includes(value);
}

export const COLORWAY_STORAGE_KEY = "keyfolk-colorway";

/**
 * Inline script executed in <head> before first paint. Reads the persisted
 * zustand state and applies the colorway attribute so there's no flash.
 */
export const COLORWAY_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  COLORWAY_STORAGE_KEY,
)});if(!s)return;var c=JSON.parse(s);c=c&&c.state&&c.state.colorway;if(${JSON.stringify(
  COLORWAY_IDS,
)}.indexOf(c)>-1)document.documentElement.setAttribute("data-colorway",c)}catch(e){}})();`;
