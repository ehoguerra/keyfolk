"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { parseQuery, toQueryString, type CatalogQuery } from "@/lib/catalog";
import { CatalogView } from "./CatalogView";

/** Catalog state lives in the URL so every filtered view is shareable. */
export function CatalogClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = parseQuery(params);
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const push = (next: CatalogQuery) => {
    if (timer.current) window.clearTimeout(timer.current);
    setDraft(null);
    router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });
  };

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <CatalogView
      query={query}
      onChange={push}
      searchValue={draft ?? query.q}
      onSearchInput={(value) => {
        setDraft(value);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          router.replace(`${pathname}${toQueryString({ ...parseQuery(new URLSearchParams(window.location.search)), q: value })}`, {
            scroll: false,
          });
          setDraft(null);
        }, 280);
      }}
    />
  );
}
