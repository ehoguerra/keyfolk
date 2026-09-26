import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const OG_SIZE = { width: 1200, height: 630 };

/** Satori can't decode WebP: convert a render from public/ to a PNG data URL at build time. */
export async function renderAsPng(publicPath: string, width: number): Promise<string> {
  const file = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const png = await sharp(await readFile(file)).resize({ width }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

export async function ogFonts() {
  const [semibold, display] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/archivo-semibold.ttf")),
    readFile(join(process.cwd(), "public/fonts/archivo-expanded-extrabold.ttf")),
  ]);
  return [
    { name: "Archivo", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Archivo Expanded", data: display, weight: 800 as const, style: "normal" as const },
  ];
}

export const OG_COLORS = {
  bg: "#D8ECEA",
  surface: "#F0FAF8",
  ink: "#0F3440",
  muted: "#49676E",
  accent: "#FFB703",
  mod: "#1F6F78",
};

/** Keycap logo mark for OG images (satori-friendly, no SVG strokes). */
export function OgMark({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 0.94,
        borderRadius: size * 0.26,
        background: OG_COLORS.ink,
        display: "flex",
        justifyContent: "center",
        paddingTop: size * 0.05,
      }}
    >
      <div
        style={{
          width: size * 0.64,
          height: size * 0.54,
          borderRadius: size * 0.16,
          background: OG_COLORS.accent,
        }}
      />
    </div>
  );
}
