import Link from "next/link";

/** Keycap mark: skirt + dished top, seen slightly from above. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="1.5" y="3" width="29" height="27" rx="8" fill="var(--ink)" />
      <rect x="6" y="4.5" width="20" height="17" rx="5" fill="var(--accent)" />
      <path d="M9.5 9.5c2 1.2 4.2 1.8 6.5 1.8s4.5-.6 6.5-1.8" fill="none" stroke="var(--accent-legend)" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 rounded-lg" aria-label="Keyfolk, página inicial">
      <span className="transition-transform duration-150 group-active:translate-y-0.5">
        <LogoMark />
      </span>
      <span className="display text-[1.35rem] leading-none tracking-[-0.03em]" style={{ fontWeight: 820 }}>
        Keyfolk
      </span>
    </Link>
  );
}
