"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { COLORWAY_LIST } from "@/lib/colorways";
import { useLive3d } from "@/lib/live3d";
import { playThock } from "@/lib/thock";
import { useColorway } from "@/store/colorway";
import { useSound } from "@/store/sound";
import { KeyAnimator } from "@/three/lib/keyAnimator";
import { LAYOUT_75, resolveCode } from "@/three/lib/layouts";
import styles from "./HeroStage.module.css";

const HeroCanvas = dynamic(() => import("@/three/scenes/HeroCanvas"), { ssr: false });

const BIG_KEYS = new Set(["Space", "ShiftLeft", "ShiftRight", "Enter", "Backspace", "CapsLock", "Tab"]);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The hero keyboard. The poster (pre-rendered with the same camera) is the LCP element;
 * the WebGL canvas loads after it and fades in on top once every legend is ready.
 */
export function HeroStage() {
  const [animator] = useState(() => new KeyAnimator());
  // the poster is the LCP element: the canvas waits for load + idle, on hardware WebGL only
  const mounted = useLive3d();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const colorway = useColorway((s) => s.colorway);
  const ref = useRef<HTMLDivElement>(null);
  const pointerKeys = useRef(new Set<string>());

  // Pause rendering while off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const press = useCallback(
    (code: string, source: "keyboard" | "pointer") => {
      if (!animator.has(code) || animator.isHeld(code)) return;
      animator.press(code);
      if (source === "pointer") pointerKeys.current.add(code);
      setLastKey(code);
      const sound = useSound.getState();
      if (sound.enabled) playThock(sound.profile, { big: BIG_KEYS.has(code) });
    },
    [animator],
  );

  const release = useCallback(
    (code: string) => {
      if (!animator.isHeld(code)) return;
      animator.release(code);
      const sound = useSound.getState();
      if (sound.enabled) playThock(sound.profile, { up: true, big: BIG_KEYS.has(code) });
    },
    [animator],
  );

  // The visitor's real keyboard drives the 3D one. We never preventDefault.
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || isEditable(e.target)) return;
      const code = resolveCode(e.code, LAYOUT_75);
      if (code) press(code, "keyboard");
    };
    const onUp = (e: KeyboardEvent) => {
      const code = resolveCode(e.code, LAYOUT_75);
      if (code) release(code);
    };
    const onPointerUp = () => {
      pointerKeys.current.forEach((code) => release(code));
      pointerKeys.current.clear();
    };
    const onBlur = () => animator.releaseAll();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [animator, press, release]);

  const handleReady = useCallback(() => {
    setReady(true);
    if (!prefersReducedMotion()) {
      window.setTimeout(() => animator.ripple(LAYOUT_75.keys.map(({ code, x, y }) => ({ code, x, y }))), 380);
    }
  }, [animator]);

  return (
    <div
      ref={ref}
      className={`hero-settle ${styles.stage}`}
      data-ready={ready ? "true" : "false"}
      data-last-key={lastKey ?? undefined}
      data-testid="hero-stage"
    >
      <div className={styles.posters} aria-hidden={ready}>
        {COLORWAY_LIST.map((cw) => (
          <Image
            key={cw.id}
            src={`/renders/hero-${cw.id}.webp`}
            alt={`Teclado Folk 75 em 3D com o colorway ${cw.name}`}
            fill
            sizes="(min-width: 1360px) 1264px, (min-width: 1024px) 94vw, 140vw"
            className="cw-poster object-contain"
            data-cw={cw.id}
            preload={cw.id === "laguna"}
            loading={cw.id === "laguna" ? undefined : "lazy"}
            quality={85}
          />
        ))}
      </div>
      {mounted ? (
        <HeroCanvas
          className={styles.canvas}
          colorway={colorway}
          animator={animator}
          active={visible}
          onReady={handleReady}
          onKeyPointerDown={(code) => press(code, "pointer")}
        />
      ) : null}
    </div>
  );
}
