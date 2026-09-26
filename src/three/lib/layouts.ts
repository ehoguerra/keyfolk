import type { KeyboardLayoutId } from "@/data/products";
import type { ProfileId } from "./keycapGeometry";

export type KeyRole = "alpha" | "mod" | "accent";
export type LegendStyle = "alpha" | "dual" | "mod" | "fn" | "arrow" | "none";

export interface KeyDef {
  /** KeyboardEvent.code (or a pseudo code like "Fn"). */
  code: string;
  /** Position/size in key units (u). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Sculpt row used for the profile. */
  row: number;
  role: KeyRole;
  legend: string;
  shift?: string;
  style: LegendStyle;
  /** Optional free placement for loose caps (degrees around Y). */
  rotation?: number;
}

export interface KeyboardLayout {
  id: string;
  keys: KeyDef[];
  width: number;
  depth: number;
  profile: ProfileId;
  knob?: { x: number; y: number };
}

interface LegendInfo {
  legend: string;
  shift?: string;
  style: LegendStyle;
  role: KeyRole;
}

const dual: Record<string, [string, string]> = {
  Backquote: ["`", "~"],
  Digit1: ["1", "!"],
  Digit2: ["2", "@"],
  Digit3: ["3", "#"],
  Digit4: ["4", "$"],
  Digit5: ["5", "%"],
  Digit6: ["6", "^"],
  Digit7: ["7", "&"],
  Digit8: ["8", "*"],
  Digit9: ["9", "("],
  Digit0: ["0", ")"],
  Minus: ["-", "_"],
  Equal: ["=", "+"],
  BracketLeft: ["[", "{"],
  BracketRight: ["]", "}"],
  Backslash: ["\\", "|"],
  Semicolon: [";", ":"],
  Quote: ["'", '"'],
  Comma: [",", "<"],
  Period: [".", ">"],
  Slash: ["/", "?"],
};
const mods: Record<string, string> = {
  Escape: "Esc",
  Delete: "Del",
  Backspace: "Backspace",
  Home: "Home",
  End: "End",
  Tab: "Tab",
  PageUp: "PgUp",
  PageDown: "PgDn",
  CapsLock: "Caps",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  MetaLeft: "Win",
  AltLeft: "Alt",
  AltRight: "Alt",
  Fn: "Fn",
  ContextMenu: "Menu",
  Insert: "Ins",
  PrintScreen: "PrtSc",
  ScrollLock: "ScrLk",
  Pause: "Pause",
  Lower: "Lower",
  Raise: "Raise",
};
const arrows: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

function legendFor(code: string): LegendInfo {
  if (code.startsWith("Key")) return { legend: code.slice(3), style: "alpha", role: "alpha" };
  if (dual[code]) {
    const [legend, shift] = dual[code];
    return { legend, shift, style: "dual", role: "alpha" };
  }
  if (/^F\d+$/.test(code)) {
    const n = Number(code.slice(1));
    return { legend: code, style: "fn", role: n >= 5 && n <= 8 ? "alpha" : "mod" };
  }
  if (arrows[code]) return { legend: arrows[code], style: "arrow", role: "mod" };
  if (code === "Space" || code.startsWith("Space")) return { legend: "", style: "none", role: "alpha" };
  if (code === "Escape" || code === "Enter") return { legend: mods[code], style: "mod", role: "accent" };
  return { legend: mods[code] ?? code, style: "mod", role: "mod" };
}

type Item = string | [code: string, width: number] | number;

interface RowSpec {
  y: number;
  row: number;
  items: Item[];
}

function build(id: string, rows: RowSpec[], opts: { profile: ProfileId; knob?: { x: number; y: number } }): KeyboardLayout {
  const keys: KeyDef[] = [];
  let width = 0;
  let depth = 0;
  for (const r of rows) {
    let x = 0;
    for (const item of r.items) {
      if (typeof item === "number") {
        x += item;
        continue;
      }
      const [code, w] = typeof item === "string" ? [item, 1] : item;
      const info = legendFor(code.replace(/#\d+$/, ""));
      keys.push({ code, x, y: r.y, w, h: 1, row: r.row, ...info });
      x += w;
    }
    width = Math.max(width, x);
    depth = Math.max(depth, r.y + 1);
  }
  if (opts.knob) width = Math.max(width, opts.knob.x + 1);
  return { id, keys, width, depth, profile: opts.profile, knob: opts.knob };
}

const k = (s: string) => s.split("").map((c) => `Key${c}`);
const digits = ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"];
const fKeys = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `F${from + i}`);
const bottomRow75: Item[] = [
  ["ControlLeft", 1.25],
  ["MetaLeft", 1.25],
  ["AltLeft", 1.25],
  ["Space", 6.25],
  "AltRight",
  "Fn",
  "ControlRight",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
];

export const LAYOUT_75 = build(
  "75",
  [
    { y: 0, row: 0, items: ["Escape", 0.25, ...fKeys(1, 4), 0.25, ...fKeys(5, 8), 0.25, ...fKeys(9, 12), 0.25, "Delete"] },
    { y: 1.25, row: 1, items: [...digits, ["Backspace", 2], "Home"] },
    { y: 2.25, row: 2, items: [["Tab", 1.5], ...k("QWERTYUIOP"), "BracketLeft", "BracketRight", ["Backslash", 1.5], "PageUp"] },
    { y: 3.25, row: 3, items: [["CapsLock", 1.75], ...k("ASDFGHJKL"), "Semicolon", "Quote", ["Enter", 2.25], "PageDown"] },
    { y: 4.25, row: 4, items: [["ShiftLeft", 2.25], ...k("ZXCVBNM"), "Comma", "Period", "Slash", ["ShiftRight", 1.75], "ArrowUp", "End"] },
    { y: 5.25, row: 5, items: bottomRow75 },
  ],
  { profile: "cherry", knob: { x: 15, y: 0 } },
);

export const LAYOUT_65 = build(
  "65",
  [
    { y: 0, row: 1, items: ["Escape", ...digits.slice(1), ["Backspace", 2], "Delete"] },
    { y: 1, row: 2, items: [["Tab", 1.5], ...k("QWERTYUIOP"), "BracketLeft", "BracketRight", ["Backslash", 1.5], "PageUp"] },
    { y: 2, row: 3, items: [["CapsLock", 1.75], ...k("ASDFGHJKL"), "Semicolon", "Quote", ["Enter", 2.25], "PageDown"] },
    { y: 3, row: 4, items: [["ShiftLeft", 2.25], ...k("ZXCVBNM"), "Comma", "Period", "Slash", ["ShiftRight", 1.75], "ArrowUp", "End"] },
    { y: 4, row: 5, items: bottomRow75 },
  ],
  { profile: "cherry" },
);

export const LAYOUT_TKL = build(
  "tkl",
  [
    { y: 0, row: 0, items: ["Escape", 1, ...fKeys(1, 4), 0.5, ...fKeys(5, 8), 0.5, ...fKeys(9, 12), 0.25, "PrintScreen", "ScrollLock", "Pause"] },
    { y: 1.5, row: 1, items: [...digits, ["Backspace", 2], 0.25, "Insert", "Home", "PageUp"] },
    { y: 2.5, row: 2, items: [["Tab", 1.5], ...k("QWERTYUIOP"), "BracketLeft", "BracketRight", ["Backslash", 1.5], 0.25, "Delete", "End", "PageDown"] },
    { y: 3.5, row: 3, items: [["CapsLock", 1.75], ...k("ASDFGHJKL"), "Semicolon", "Quote", ["Enter", 2.25]] },
    { y: 4.5, row: 4, items: [["ShiftLeft", 2.25], ...k("ZXCVBNM"), "Comma", "Period", "Slash", ["ShiftRight", 2.75], 1.25, "ArrowUp"] },
    {
      y: 5.5,
      row: 5,
      items: [
        ["ControlLeft", 1.25],
        ["MetaLeft", 1.25],
        ["AltLeft", 1.25],
        ["Space", 6.25],
        ["AltRight", 1.25],
        ["Fn", 1.25],
        ["ContextMenu", 1.25],
        ["ControlRight", 1.25],
        0.25,
        "ArrowLeft",
        "ArrowDown",
        "ArrowRight",
      ],
    },
  ],
  { profile: "cherry" },
);

export const LAYOUT_40_ORTO = build(
  "40-orto",
  [
    { y: 0, row: 2, items: ["Tab", ...k("QWERTYUIOP"), "Backspace"] },
    { y: 1, row: 3, items: ["Escape", ...k("ASDFGHJKL"), "Semicolon", "Quote"] },
    { y: 2, row: 4, items: ["ShiftLeft", ...k("ZXCVBNM"), "Comma", "Period", "Slash", "Enter"] },
    { y: 3, row: 5, items: ["Fn", "ControlLeft", "AltLeft", "MetaLeft", "Lower", ["Space", 2], "Raise", "ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight"] },
  ],
  { profile: "uniform" },
);

/** A partial layout used to present keycap sets (no case). */
export const LAYOUT_CLUSTER: KeyboardLayout = (() => {
  const base = build(
    "cluster",
    [
      { y: 0, row: 0, items: ["Escape", 0.25, ...fKeys(1, 4)] },
      { y: 1.25, row: 1, items: digits.slice(0, 7) },
      { y: 2.25, row: 2, items: [["Tab", 1.5], ...k("QWERTY")] },
      { y: 3.25, row: 3, items: [["CapsLock", 1.75], ...k("ASDFG")] },
      { y: 4.25, row: 4, items: [["ShiftLeft", 2.25], ...k("ZXCV")] },
      { y: 5.25, row: 5, items: [["ControlLeft", 1.25], ["MetaLeft", 1.25], ["AltLeft", 1.25]] },
    ],
    { profile: "cherry" },
  );
  const loose: KeyDef[] = [
    { code: "Enter", x: 8.35, y: 3.1, w: 2.25, h: 1, row: 3, rotation: -14, ...legendFor("Enter") },
    { code: "KeyK", x: 8.6, y: 4.75, w: 1, h: 1, row: 3, rotation: 9, ...legendFor("KeyK") },
    { code: "Backspace", x: 8.1, y: 1.45, w: 2, h: 1, row: 1, rotation: 6, ...legendFor("Backspace") },
  ];
  return { ...base, keys: [...base.keys, ...loose], width: 10.6 };
})();

export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutId, KeyboardLayout> = {
  "75": LAYOUT_75,
  "65": LAYOUT_65,
  tkl: LAYOUT_TKL,
  "40-orto": LAYOUT_40_ORTO,
};

/** Physical keys that should light up a key of the 75% layout. */
const ALIASES: Record<string, string> = {
  NumpadEnter: "Enter",
  IntlBackslash: "ShiftLeft",
  IntlRo: "ShiftRight",
  MetaRight: "Fn",
  OSLeft: "MetaLeft",
  OSRight: "Fn",
  ContextMenu: "Fn",
  Insert: "Delete",
  PrintScreen: "Delete",
  ScrollLock: "Delete",
  Pause: "Delete",
  NumpadDecimal: "Period",
  NumpadAdd: "Equal",
  NumpadSubtract: "Minus",
  NumpadMultiply: "Digit8",
  NumpadDivide: "Slash",
  NumpadEqual: "Equal",
  Numpad0: "Digit0",
  Numpad1: "Digit1",
  Numpad2: "Digit2",
  Numpad3: "Digit3",
  Numpad4: "Digit4",
  Numpad5: "Digit5",
  Numpad6: "Digit6",
  Numpad7: "Digit7",
  Numpad8: "Digit8",
  Numpad9: "Digit9",
};

export function resolveCode(code: string, layout: KeyboardLayout): string | null {
  const direct = layout.keys.some((key) => key.code === code);
  if (direct) return code;
  const alias = ALIASES[code];
  if (alias && layout.keys.some((key) => key.code === alias)) return alias;
  return null;
}

/** All glyphs needed by a layout (troika preloads them). */
export function layoutCharacters(layout: KeyboardLayout): string {
  const set = new Set<string>();
  for (const key of layout.keys) {
    for (const ch of key.legend + (key.shift ?? "")) set.add(ch);
  }
  set.add("k");
  "keyfolk".split("").forEach((c) => set.add(c));
  return [...set].join("");
}
