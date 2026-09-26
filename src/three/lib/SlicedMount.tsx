"use client";

import { startTransition, useEffect, useState, type ReactNode } from "react";

/**
 * Mounts its children as a transition. R3F renders on a concurrent root, so React builds the scene
 * (geometry, materials, one mesh per key) in small time slices instead of one long main-thread task.
 */
export function SlicedMount({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    startTransition(() => setShow(true));
  }, []);
  return show ? children : null;
}
