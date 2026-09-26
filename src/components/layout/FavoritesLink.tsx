"use client";

import Link from "next/link";
import { useFavorites } from "@/store/favorites";
import { useHydrated } from "@/lib/useHydrated";
import { Icon } from "../ui/Icon";

export function FavoritesLink() {
  const count = useFavorites((s) => s.ids.length);
  const hydrated = useHydrated(useFavorites);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/favoritos"
      className="icon-btn relative"
      aria-label={shown ? `Favoritos, ${shown} ${shown === 1 ? "produto" : "produtos"}` : "Favoritos"}
    >
      <Icon name={shown ? "heart-fill" : "heart"} />
      {shown > 0 ? (
        <span className="price ui absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] leading-none text-bg shadow-[0_0_0_2px_var(--bg)]">
          {shown}
        </span>
      ) : null}
    </Link>
  );
}
