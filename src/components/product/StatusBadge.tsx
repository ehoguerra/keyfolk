import type { ProductStatus } from "@/data/products";

export function statusLabel(status: ProductStatus): string {
  switch (status.kind) {
    case "in-stock":
      return "Em estoque";
    case "low-stock":
      return `Últimas ${status.left} unidades`;
    case "preorder":
      return status.label;
    case "sold-out":
      return "Esgotado";
  }
}

/** Short form for narrow cards (phones). */
function shortLabel(status: ProductStatus): string {
  switch (status.kind) {
    case "low-stock":
      return `Últimas ${status.left}`;
    case "preorder":
      return "Pré-venda";
    default:
      return statusLabel(status);
  }
}

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
  /** Use the short label below the `sm` breakpoint. */
  compact?: boolean;
}

export function StatusBadge({ status, className = "", compact = false }: StatusBadgeProps) {
  const tone =
    status.kind === "sold-out"
      ? "bg-ink text-bg"
      : status.kind === "preorder"
        ? "bg-accent text-accent-legend"
        : status.kind === "low-stock"
          ? "bg-bg text-ink border border-line-strong"
          : "bg-bg text-ink border border-line";
  return (
    <span className={`ui inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${tone} ${className}`}>
      {status.kind === "in-stock" || status.kind === "low-stock" ? (
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${status.kind === "low-stock" ? "bg-[#d97706]" : "bg-[#16a34a]"}`}
        />
      ) : null}
      {compact && shortLabel(status) !== statusLabel(status) ? (
        <>
          <span className="sm:hidden">{shortLabel(status)}</span>
          <span className="hidden sm:inline">{statusLabel(status)}</span>
        </>
      ) : (
        statusLabel(status)
      )}
    </span>
  );
}
