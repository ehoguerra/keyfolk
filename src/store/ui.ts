"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

interface UiState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toasts: Toast[];
  toast: (message: string, action?: Toast["action"]) => void;
  dismiss: (id: number) => void;
  /** Polite live-region message (screen readers). */
  announcement: string;
  announce: (message: string) => void;
}

let nextId = 1;

export const useUi = create<UiState>()((set, get) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toasts: [],
  toast: (message, action) => {
    const id = nextId++;
    set({ toasts: [...get().toasts.slice(-2), { id, message, action }] });
    window.setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  announcement: "",
  announce: (message) => {
    // Clear first so repeated identical messages are still announced.
    set({ announcement: "" });
    window.setTimeout(() => set({ announcement: message }), 60);
  },
}));
