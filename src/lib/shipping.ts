/** Rough delivery windows by CEP region (first digit), in business days from São Paulo. */
const REGIONS: Array<{ test: RegExp; name: string; pac: [number, number]; sedex: [number, number] }> = [
  { test: /^[01]/, name: "São Paulo", pac: [3, 5], sedex: [1, 2] },
  { test: /^2/, name: "Rio de Janeiro e Espírito Santo", pac: [4, 6], sedex: [2, 3] },
  { test: /^3/, name: "Minas Gerais", pac: [4, 6], sedex: [2, 3] },
  { test: /^[45]/, name: "Bahia, Sergipe e Nordeste leste", pac: [6, 9], sedex: [3, 4] },
  { test: /^6/, name: "Norte e Nordeste oeste", pac: [8, 12], sedex: [4, 6] },
  { test: /^7/, name: "Centro-Oeste", pac: [5, 8], sedex: [2, 4] },
  { test: /^[89]/, name: "Sul", pac: [4, 7], sedex: [2, 3] },
];

export function cepDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string): string {
  const d = cepDigits(value);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

export interface DeliveryEstimate {
  region: string;
  pac: [Date, Date];
  sedex: [Date, Date];
}

/** Returns null for CEPs that can't exist (e.g. 00000-000). */
export function estimateDelivery(cep: string, today = new Date()): DeliveryEstimate | null {
  const d = cepDigits(cep);
  if (d.length !== 8 || /^0{5}/.test(d)) return null;
  const region = REGIONS.find((r) => r.test.test(d));
  if (!region) return null;
  // Orders ship the next business day.
  const ship = addBusinessDays(today, 1);
  return {
    region: region.name,
    pac: [addBusinessDays(ship, region.pac[0]), addBusinessDays(ship, region.pac[1])],
    sedex: [addBusinessDays(ship, region.sedex[0]), addBusinessDays(ship, region.sedex[1])],
  };
}
