"use client";

import { useSyncExternalStore } from "react";

interface Persisted {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

/** True once a zustand persisted store has read localStorage (false during SSR/first paint). */
export function useHydrated(store: Persisted): boolean {
  return useSyncExternalStore(
    (cb) => store.persist.onFinishHydration(cb),
    () => store.persist.hasHydrated(),
    () => false,
  );
}

const noop = () => () => {};

/** True on the client after hydration. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
