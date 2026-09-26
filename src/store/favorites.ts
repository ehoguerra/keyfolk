"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IdSetState {
  ids: string[];
  toggle: (id: string) => boolean;
  has: (id: string) => boolean;
}

function idSetStore(name: string) {
  return create<IdSetState>()(
    persist(
      (set, get) => ({
        ids: [],
        toggle: (id) => {
          const on = !get().ids.includes(id);
          set({ ids: on ? [...get().ids, id] : get().ids.filter((x) => x !== id) });
          return on;
        },
        has: (id) => get().ids.includes(id),
      }),
      {
        name,
        storage: createJSONStorage(() => localStorage),
        partialize: (s) => ({ ids: s.ids }),
        skipHydration: true,
      },
    ),
  );
}

/** Wishlist (product ids). */
export const useFavorites = idSetStore("keyfolk-favorites");

/** "Avise-me quando chegar" reminders for sold-out products (product ids). */
export const useReminders = idSetStore("keyfolk-reminders");
