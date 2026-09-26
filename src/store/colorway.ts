"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { COLORWAY_STORAGE_KEY, DEFAULT_COLORWAY, type ColorwayId } from "@/lib/colorways";

interface ColorwayState {
  colorway: ColorwayId;
  setColorway: (id: ColorwayId) => void;
}

export const useColorway = create<ColorwayState>()(
  persist(
    (set) => ({
      colorway: DEFAULT_COLORWAY,
      setColorway: (colorway) => set({ colorway }),
    }),
    {
      name: COLORWAY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ colorway: s.colorway }),
      skipHydration: true,
    },
  ),
);
