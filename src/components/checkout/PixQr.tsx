/** Deterministic module pattern from a seed (outside render so it stays pure). */
function qrCells(seed: string, size: number): Array<[number, number]> {
  let s = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const finder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (finder(x, y)) continue;
      if (rand() > 0.52) cells.push([x, y]);
    }
  }
  return cells;
}

/** Decorative Pix-style QR pattern generated from a seed. Not a real, scannable code. */
export function PixQr({ seed, size = 29 }: { seed: string; size?: number }) {
  const cells = qrCells(seed, size);
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.6} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={1} fill="var(--qr-bg, white)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.8} fill="currentColor" />
    </g>
  );
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} role="img" aria-label="QR code ilustrativo do Pix (demonstração, não é um código real)" className="h-auto w-full">
      <rect x={-2} y={-2} width={size + 4} height={size + 4} rx={3} fill="var(--qr-bg, white)" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.22} fill="currentColor" />
      ))}
      {eye(0, 0)}
      {eye(size - 7, 0)}
      {eye(0, size - 7)}
    </svg>
  );
}
