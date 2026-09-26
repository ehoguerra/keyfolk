"use client";

import type { RootState } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a canvas from drawing until every shader its scene needs has been compiled in parallel
 * (KHR_parallel_shader_compile), so the first frame never stalls the main thread on shader links.
 *
 * Usage: render the canvas with `frameloop={gate.compiled ? ... : "never"}`, pass `gate.onCreated`
 * to the canvas and `gate.onSceneReady` to the scene (called once its models are complete, e.g.
 * legends synced). `onReady` fires after the first real frames have been drawn.
 */
export function useCompileGate(onReady: () => void) {
  const state = useRef<RootState | null>(null);
  const [compiled, setCompiled] = useState(false);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  });

  const onCreated = useCallback((s: RootState) => {
    state.current = s;
  }, []);

  const onSceneReady = useCallback(() => {
    const s = state.current;
    const done = () => setCompiled(true);
    if (!s) return done();
    s.gl.compileAsync(s.scene, s.camera).then(done, done);
  }, []);

  useEffect(() => {
    if (!compiled) return;
    state.current?.invalidate();
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => readyRef.current());
    });
    return () => cancelAnimationFrame(raf);
  }, [compiled]);

  return { compiled, onCreated, onSceneReady };
}
