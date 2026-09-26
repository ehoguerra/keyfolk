import { Icon } from "./Icon";

export function Rating({ value, count, className = "" }: { value: number; count?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <span className="flex text-ink" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name="star" size={15} className={i < full ? "" : "opacity-20"} />
        ))}
      </span>
      <span className="price">
        <span className="sr-only">Nota </span>
        {value.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
        <span className="sr-only"> de 5</span>
        {count !== undefined ? <span className="text-muted"> ({count} avaliações)</span> : null}
      </span>
    </span>
  );
}
