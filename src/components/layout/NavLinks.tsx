"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_LINKS.map((l) => {
          const current = l.href === "/loja" && pathname === "/loja";
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className="ui relative rounded-[10px] px-3 py-2 text-[0.9375rem] text-ink/80 transition-colors hover:bg-wash hover:text-ink aria-[current=page]:text-ink"
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
