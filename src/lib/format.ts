const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formats a value in BRL, e.g. 1890 → "R$ 1.890,00". */
export function formatBRL(value: number): string {
  // Intl inserts a non-breaking space after "R$"; keep it so prices never wrap.
  return brl.format(value);
}

/** Installments without interest, e.g. 10x de R$ 189,00. */
export function installments(value: number, max = 10): { count: number; each: number } {
  const count = value >= 300 ? max : Math.max(1, Math.floor(value / 30));
  return { count, each: Math.round((value / count) * 100) / 100 };
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });
const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" });

export function formatDayMonth(date: Date): string {
  return dateFmt.format(date);
}

export function formatShortDate(date: Date): string {
  return weekdayFmt.format(date);
}
