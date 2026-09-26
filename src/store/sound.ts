"use client";

import { create } from "zustand";
import type { SwitchType } from "@/data/products";

interface SoundState {
  enabled: boolean;
  profile: SwitchType;
  setEnabled: (on: boolean) => void;
  setProfile: (profile: SwitchType) => void;
}

/** Sound is off on every visit; the choice lives only for the session. */
export const useSound = create<SoundState>()((set) => ({
  enabled: false,
  profile: "tatil",
  setEnabled: (enabled) => set({ enabled }),
  setProfile: (profile) => set({ profile }),
}));
