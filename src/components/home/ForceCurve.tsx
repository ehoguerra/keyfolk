import type { SwitchType } from "@/data/products";

/** Approximate force curves (travel mm → grams). */
const CURVES: Record<SwitchType, Array<[number, number]>> = {
  linear: [
    [0, 0],
    [0.05, 33],
    [2, 45],
    [3.6, 53],
    [3.75, 80],
  ],
  tatil: [
    [0, 0],
    [0.05, 38],
    [0.55, 62],
    [1.3, 44],
    [2, 50],
    [3.6, 67],
    [3.75, 80],
  ],
  clicky: [
    [0, 0],
    [0.05, 36],
    [1.6, 60],
    [1.85, 40],
    [2.1, 47],
    [3.6, 70],
    [3.75, 80],
  ],
};

const ACTUATION: Record<SwitchType, number> = { linear: 2, tatil: 1.9, clicky: 1.8 };

export function ForceCurve({ type, className = "" }: { type: SwitchType; className?: string }) {
  const W = 320;
  const H = 120;
  const pad = { l: 34, r: 8, t: 10, b: 22 };
  const x = (mm: number) => pad.l + (mm / 4) * (W - pad.l - pad.r);
  const y = (g: number) => H - pad.b - (g / 80) * (H - pad.t - pad.b);
  const d = CURVES[type].map(([mm, g], i) => `${i ? "L" : "M"}${x(mm).toFixed(1)},${y(g).toFixed(1)}`).join(" ");
  const act = ACTUATION[type];
  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Curva de força do switch ${type}: força em gramas ao longo de 4 mm de curso.`}>
        {[20, 40, 60].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(g) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">
              {g}g
            </text>
          </g>
        ))}
        <line x1={x(act)} x2={x(act)} y1={pad.t} y2={H - pad.b} stroke="var(--muted)" strokeDasharray="3 3" strokeWidth="1" />
        <text x={x(act) + 4} y={pad.t + 9} fontSize="10" fill="var(--muted)">
          acionamento
        </text>
        <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <text x={pad.l} y={H - 6} fontSize="10" fill="var(--muted)">
          0 mm
        </text>
        <text x={W - pad.r} y={H - 6} fontSize="10" textAnchor="end" fill="var(--muted)">
          4 mm
        </text>
      </svg>
      <figcaption className="sr-only">Curva de força ao longo do curso da tecla</figcaption>
    </figure>
  );
}
