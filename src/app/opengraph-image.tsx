import { ImageResponse } from "next/og";
import { OG_COLORS, OG_SIZE, OgMark, ogFonts, renderAsPng } from "@/lib/og";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

export const alt = DEFAULT_OG_IMAGE.alt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, hero] = await Promise.all([ogFonts(), renderAsPng("/renders/hero-laguna.webp", 1400)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG_COLORS.bg,
          padding: "56px 64px 0",
          fontFamily: "Archivo",
          color: OG_COLORS.ink,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OgMark />
          <span style={{ fontFamily: "Archivo Expanded", fontSize: 34, letterSpacing: -1 }}>Keyfolk</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 34,
            fontFamily: "Archivo Expanded",
            fontSize: 76,
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          <span>Teclados que dão vontade</span>
          <span>de digitar.</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt=""
          width={1400}
          height={560}
          style={{ position: "absolute", left: -100, bottom: -150, width: 1400, height: 560 }}
        />
      </div>
    ),
    { ...size, fonts },
  );
}
