/** Three loose keycaps drawn in CSS, using the active colorway. */
export function EmptyKeys({ className = "" }: { className?: string }) {
  const cap = "ui grid place-items-center rounded-[12px] shadow-[inset_0_-6px_0_rgb(0_0_0/0.14),0_8px_14px_-8px_var(--shadow-color)]";
  return (
    <div className={`flex items-end gap-2 ${className}`} aria-hidden="true">
      <span className={`${cap} size-14 -rotate-6 bg-mod text-mod-legend`}>K</span>
      <span className={`${cap} size-14 bg-alpha text-alpha-legend ring-1 ring-line`}>F</span>
      <span className={`${cap} h-14 w-24 rotate-3 bg-accent text-sm text-accent-legend`}>Enter</span>
    </div>
  );
}
