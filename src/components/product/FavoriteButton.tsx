"use client";

import { useHydrated } from "@/lib/useHydrated";
import { useFavorites } from "@/store/favorites";
import { useUi } from "@/store/ui";
import { Icon } from "../ui/Icon";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({ productId, productName, variant = "icon", className = "" }: FavoriteButtonProps) {
  const hydrated = useHydrated(useFavorites);
  const on = useFavorites((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useFavorites((s) => s.toggle);
  const announce = useUi((s) => s.announce);
  const handle = () => {
    const now = toggle(productId);
    announce(now ? `${productName} adicionado aos favoritos.` : `${productName} removido dos favoritos.`);
  };
  if (variant === "button") {
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={handle}
        className={`btn ${className}`}
        data-testid="favorite-toggle"
      >
        <Icon name={on ? "heart-fill" : "heart"} size={20} />
        {on ? "Nos favoritos" : "Favoritar"}
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remover ${productName} dos favoritos` : `Favoritar ${productName}`}
      onClick={handle}
      className={`grid size-10 place-items-center rounded-full bg-bg/80 text-ink backdrop-blur transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <Icon name={on ? "heart-fill" : "heart"} size={19} />
    </button>
  );
}
