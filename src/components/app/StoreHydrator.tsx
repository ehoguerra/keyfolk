"use client";

import { useEffect, useLayoutEffect } from "react";
import { COLORWAYS, type ColorwayId } from "@/lib/colorways";
import { useCart } from "@/store/cart";
import { useColorway } from "@/store/colorway";
import { useFavorites, useReminders } from "@/store/favorites";

function applyColorway(id: ColorwayId) {
  const root = document.documentElement;
  if (root.getAttribute("data-colorway") !== id) root.setAttribute("data-colorway", id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", COLORWAYS[id].bg);
}

/**
 * Rehydrates persisted stores after the first client render (so SSR markup matches),
 * and keeps <html data-colorway> in sync with the colorway store.
 */
export function StoreHydrator() {
  useLayoutEffect(() => {
    const unsub = useColorway.subscribe((s) => applyColorway(s.colorway));
    void useColorway.persist.rehydrate();
    // In dev, React may reset <html> attributes on remount; re-apply the persisted value.
    applyColorway(useColorway.getState().colorway);
    return unsub;
  }, []);

  useEffect(() => {
    void useCart.persist.rehydrate();
    void useFavorites.persist.rehydrate();
    void useReminders.persist.rehydrate();

    // Keep tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "keyfolk-cart") void useCart.persist.rehydrate();
      if (e.key === "keyfolk-favorites") void useFavorites.persist.rehydrate();
      if (e.key === "keyfolk-reminders") void useReminders.persist.rehydrate();
      if (e.key === "keyfolk-colorway") void useColorway.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
