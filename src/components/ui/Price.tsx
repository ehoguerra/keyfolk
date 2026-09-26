import { formatBRL } from "@/lib/format";

interface PriceProps {
  value: number;
  compareAt?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Price({ value, compareAt, className = "", size = "md" }: PriceProps) {
  const main = size === "lg" ? "text-2xl md:text-[2rem]" : size === "sm" ? "text-base" : "text-lg";
  return (
    <span className={`price inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`ui ${main}`} style={{ fontWeight: 700 }}>
        {formatBRL(value)}
      </span>
      {compareAt && compareAt > value ? (
        <span className="text-sm text-muted line-through decoration-1">
          <span className="sr-only">Preço anterior: </span>
          {formatBRL(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
