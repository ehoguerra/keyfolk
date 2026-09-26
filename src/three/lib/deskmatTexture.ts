/**
 * Procedural deskmat artwork drawn on a canvas (no image assets).
 * The canvas maps to a 900 × 400 mm mat.
 */

const W = 2700;
const H = 1200;
const PX_PER_MM = W / 900;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Smooth height field made of a few gaussian hills and ridges. */
function heightField(seed: number) {
  const rand = rng(seed);
  const hills = Array.from({ length: 9 }, () => ({
    x: rand() * 900,
    y: rand() * 400,
    r: 60 + rand() * 170,
    h: (rand() > 0.25 ? 1 : -0.6) * (0.5 + rand()),
  }));
  return (x: number, y: number) => {
    let v = 0;
    for (const hill of hills) {
      const dx = x - hill.x;
      const dy = y - hill.y;
      v += hill.h * Math.exp(-(dx * dx + dy * dy) / (2 * hill.r * hill.r));
    }
    v += 0.08 * Math.sin(x / 47 + y / 83) + 0.05 * Math.cos(y / 29 - x / 131);
    return v;
  };
}

function drawContours(ctx: CanvasRenderingContext2D, ink: string, accent: string) {
  const f = heightField(7);
  const cell = 3; // mm
  const nx = Math.ceil(900 / cell) + 1;
  const ny = Math.ceil(400 / cell) + 1;
  const grid = new Float32Array(nx * ny);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v = f(i * cell, j * cell);
      grid[j * nx + i] = v;
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
  }
  const levels = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let l = 1; l < levels; l++) {
    const iso = min + ((max - min) * l) / levels;
    const major = l % 5 === 0;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = major ? 0.95 : 0.62;
    ctx.lineWidth = (major ? 1.25 : 0.6) * PX_PER_MM;
    ctx.beginPath();
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = grid[j * nx + i];
        const b = grid[j * nx + i + 1];
        const c = grid[(j + 1) * nx + i + 1];
        const d = grid[(j + 1) * nx + i];
        const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x0 = i * cell;
        const y0 = j * cell;
        const lerp = (p: number, q: number) => (iso - p) / (q - p);
        const top: [number, number] = [x0 + cell * lerp(a, b), y0];
        const right: [number, number] = [x0 + cell, y0 + cell * lerp(b, c)];
        const bottom: [number, number] = [x0 + cell * lerp(d, c), y0 + cell];
        const left: [number, number] = [x0, y0 + cell * lerp(a, d)];
        const segs: Array<[[number, number], [number, number]]> = [];
        switch (idx) {
          case 1:
          case 14:
            segs.push([left, bottom]);
            break;
          case 2:
          case 13:
            segs.push([bottom, right]);
            break;
          case 3:
          case 12:
            segs.push([left, right]);
            break;
          case 4:
          case 11:
            segs.push([top, right]);
            break;
          case 5:
            segs.push([left, top], [bottom, right]);
            break;
          case 6:
          case 9:
            segs.push([top, bottom]);
            break;
          case 7:
          case 8:
            segs.push([left, top]);
            break;
          case 10:
            segs.push([left, bottom], [top, right]);
            break;
        }
        for (const [p, q] of segs) {
          ctx.moveTo(p[0] * PX_PER_MM, p[1] * PX_PER_MM);
          ctx.lineTo(q[0] * PX_PER_MM, q[1] * PX_PER_MM);
        }
      }
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Summit marker + route
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 1.1 * PX_PER_MM;
  ctx.setLineDash([4 * PX_PER_MM, 3 * PX_PER_MM]);
  ctx.beginPath();
  ctx.moveTo(120 * PX_PER_MM, 330 * PX_PER_MM);
  ctx.bezierCurveTo(260 * PX_PER_MM, 300 * PX_PER_MM, 330 * PX_PER_MM, 170 * PX_PER_MM, 470 * PX_PER_MM, 150 * PX_PER_MM);
  ctx.bezierCurveTo(560 * PX_PER_MM, 140 * PX_PER_MM, 620 * PX_PER_MM, 90 * PX_PER_MM, 700 * PX_PER_MM, 70 * PX_PER_MM);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(700 * PX_PER_MM, 70 * PX_PER_MM, 3.2 * PX_PER_MM, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrid(ctx: CanvasRenderingContext2D, ink: string, accent: string) {
  for (let x = 0; x <= 900; x += 5) {
    const major = x % 50 === 0;
    const mid = x % 10 === 0;
    if (!mid && !major) continue;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = major ? 0.55 : 0.2;
    ctx.lineWidth = (major ? 0.55 : 0.3) * PX_PER_MM;
    ctx.beginPath();
    ctx.moveTo(x * PX_PER_MM, 0);
    ctx.lineTo(x * PX_PER_MM, H);
    ctx.stroke();
  }
  for (let y = 0; y <= 400; y += 10) {
    const major = y % 50 === 0;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = major ? 0.55 : 0.2;
    ctx.lineWidth = (major ? 0.55 : 0.3) * PX_PER_MM;
    ctx.beginPath();
    ctx.moveTo(0, y * PX_PER_MM);
    ctx.lineTo(W, y * PX_PER_MM);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Crosshair marks on major intersections
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.7 * PX_PER_MM;
  for (let x = 100; x < 900; x += 100) {
    for (let y = 100; y < 400; y += 100) {
      ctx.beginPath();
      ctx.moveTo((x - 3) * PX_PER_MM, y * PX_PER_MM);
      ctx.lineTo((x + 3) * PX_PER_MM, y * PX_PER_MM);
      ctx.moveTo(x * PX_PER_MM, (y - 3) * PX_PER_MM);
      ctx.lineTo(x * PX_PER_MM, (y + 3) * PX_PER_MM);
      ctx.stroke();
    }
  }
  // Accent: a ruler along the bottom edge and one highlighted square
  ctx.fillStyle = accent;
  ctx.fillRect(40 * PX_PER_MM, 360 * PX_PER_MM, 10 * PX_PER_MM, 10 * PX_PER_MM);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.9 * PX_PER_MM;
  ctx.beginPath();
  ctx.moveTo(60 * PX_PER_MM, 365 * PX_PER_MM);
  ctx.lineTo(250 * PX_PER_MM, 365 * PX_PER_MM);
  ctx.stroke();
}

export function drawDeskmat(pattern: "topografia" | "grade", base: string, ink: string, accent: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  // subtle woven texture
  const rand = rng(3);
  ctx.globalAlpha = 0.035;
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(rand() * W, rand() * H, 2, 2);
  }
  ctx.globalAlpha = 1;
  if (pattern === "topografia") drawContours(ctx, ink, accent);
  else drawGrid(ctx, ink, accent);

  // Wordmark bottom-right
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  ctx.font = `800 ${9 * PX_PER_MM}px "Archivo Keyfolk", Arial, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("keyfolk", 870 * PX_PER_MM, 382 * PX_PER_MM);
  ctx.font = `600 ${4 * PX_PER_MM}px "Archivo Keyfolk", Arial, sans-serif`;
  ctx.globalAlpha = 0.6;
  ctx.fillText(pattern === "topografia" ? "serra da folk — 1:25 000" : "grade 10 mm", 870 * PX_PER_MM, 392 * PX_PER_MM);
  ctx.globalAlpha = 1;
  return canvas;
}

/** Loads the self-hosted Archivo files so canvas text uses the brand font. */
export async function ensureCanvasFonts(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const already = [...document.fonts].some((f) => f.family.replace(/"/g, "") === "Archivo Keyfolk");
  if (already) return;
  const faces = [
    new FontFace("Archivo Keyfolk", "url(/fonts/archivo-semibold.ttf)", { weight: "600" }),
    new FontFace("Archivo Keyfolk", "url(/fonts/archivo-expanded-extrabold.ttf)", { weight: "800" }),
  ];
  const loaded = await Promise.all(faces.map((f) => f.load().catch(() => null)));
  loaded.forEach((f) => f && document.fonts.add(f));
}
