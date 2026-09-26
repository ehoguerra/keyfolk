"use client";

import { useEffect, useState } from "react";

/**
 * Hardware-accelerated WebGL only. Visitors whose browser would render WebGL in software (no GPU,
 * blocklisted driver, headless) keep the pre-rendered posters, which show the same scene, instead
 * of a canvas that would stutter and pin the CPU.
 */
export function hasHardwareWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = c.getContext("webgl2", opts) ?? c.getContext("webgl", opts);
    if (!gl) return false;
    // Firefox reports the real renderer directly; Chromium and WebKit mask it behind the debug extension
    let renderer = String(gl.getParameter(gl.RENDERER));
    if (/webkit webgl/i.test(renderer)) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render|\bwarp\b/i.test(renderer);
  } catch {
    return false;
  }
}

/**
 * True once the page has fully loaded (posters included) and the main thread is idle, on devices
 * with hardware WebGL. Canvases mount behind this so they never compete with the first paint.
 */
export function useLive3d(): boolean {
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!hasHardwareWebGL()) return;
    const start = () => setLive(true);
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(start, { timeout: 2000 });
      else timer = setTimeout(start, 500);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);
  return live;
}

/** Phones get a lighter render target; PerformanceMonitor steps down further if frames drop. */
export function maxDpr(): number {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 1.5 : 1.75;
}
