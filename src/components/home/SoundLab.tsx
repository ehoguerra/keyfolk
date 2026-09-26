"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProduct, SWITCH_TYPE_LABEL, type SwitchType } from "@/data/products";
import { formatBRL } from "@/lib/format";
import { useLive3d } from "@/lib/live3d";
import { playThock, unlockAudio } from "@/lib/thock";
import { useSound } from "@/store/sound";
import { KeyAnimator } from "@/three/lib/keyAnimator";
import { ForceCurve } from "./ForceCurve";
import styles from "./SoundLab.module.css";

const SwitchLabCanvas = dynamic(() => import("@/three/scenes/SwitchLabCanvas"), { ssr: false });

const TYPES: Array<{ type: SwitchType; slug: string; blurb: string }> = [
  { type: "linear", slug: "creme", blurb: "Desce liso do começo ao fim. Som grave e redondo." },
  { type: "tatil", slug: "degrau", blurb: "Um degrau no topo avisa que a tecla registrou. Som médio." },
  { type: "clicky", slug: "estalo", blurb: "Clique nítido na descida e na volta. Todo mundo escuta." },
];

export function SoundLab() {
  const profile = useSound((s) => s.profile);
  const setProfile = useSound((s) => s.setProfile);
  const [animator] = useState(() => new KeyAnimator());
  const [near, setNear] = useState(false);
  const live = useLive3d();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [presses, setPresses] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const current = TYPES.find((t) => t.type === profile) ?? TYPES[1];
  const product = getProduct(current.slug)!;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const press = useCallback(() => {
    if (animator.isHeld("switch")) return;
    unlockAudio();
    animator.press("switch");
    playThock(useSound.getState().profile);
    setPresses((n) => n + 1);
  }, [animator]);

  const release = useCallback(() => {
    if (!animator.isHeld("switch")) return;
    animator.release("switch");
    playThock(useSound.getState().profile, { up: true });
  }, [animator]);

  useEffect(() => {
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [release]);

  return (
    <section aria-labelledby="som" className="container-k mt-24 md:mt-36">
      <div className="grid-k gap-y-10">
        <div className="col-span-4 flex flex-col gap-7 md:col-span-5 md:pr-6">
          <div>
            <h2 id="som" className="display text-[clamp(2.25rem,4.6vw,3.5rem)]">
              Escolha pelo som
            </h2>
            <p className="prose-k mt-4 text-lg text-muted">
              Cada switch tem um jeito de descer e um som. Escolha um tipo e aperte a tecla: o som é sintetizado ao vivo, no seu
              navegador.
            </p>
          </div>

          <div role="radiogroup" aria-label="Tipo de switch" className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                role="radio"
                aria-checked={profile === t.type}
                className="chip"
                onClick={() => setProfile(t.type)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  const i = TYPES.findIndex((x) => x.type === profile);
                  const next = TYPES[(i + (e.key === "ArrowRight" ? 1 : TYPES.length - 1)) % TYPES.length];
                  setProfile(next.type);
                  const parent = e.currentTarget.parentElement;
                  requestAnimationFrame(() =>
                    (parent?.querySelector(`[data-type="${next.type}"]`) as HTMLButtonElement | null)?.focus(),
                  );
                }}
                tabIndex={profile === t.type ? 0 : -1}
                data-type={t.type}
              >
                {SWITCH_TYPE_LABEL[t.type]}
              </button>
            ))}
          </div>

          <div className="rounded-[22px] border border-line bg-surface p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="ui text-xl">
                  {product.name} <span className="text-muted">({SWITCH_TYPE_LABEL[current.type].toLowerCase()})</span>
                </p>
                <p className="mt-1 text-[0.9375rem] text-muted">{current.blurb}</p>
              </div>
              <p className="price ui shrink-0 text-right">
                {formatBRL(product.price)}
                <span className="block text-xs font-normal text-muted">pack com 70</span>
              </p>
            </div>
            <ForceCurve type={current.type} className="mt-5" />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link href={`/produto/${product.slug}`} className="link ui text-[0.9375rem]">
                Ver o {product.name}
                {product.status.kind === "sold-out" ? " (esgotado)" : ""}
              </Link>
              <span className="price text-sm text-muted" aria-live="polite">
                {presses > 0 ? `${presses} ${presses === 1 ? "tecla apertada" : "teclas apertadas"}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-7">
          <div ref={stageRef} className={styles.stage} data-ready={ready ? "true" : "false"}>
            <div className={styles.poster} aria-hidden="true">
              <Image src={`/renders/lab-${current.type}.webp`} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-contain" />
            </div>
            {near && live ? (
              <SwitchLabCanvas
                className={styles.canvas}
                product={product}
                animator={animator}
                active={visible}
                onReady={() => setReady(true)}
                onPress={press}
              />
            ) : null}
            <button
              type="button"
              className={styles.pressKey}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture?.(e.pointerId);
                press();
              }}
              onPointerUp={release}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  press();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") release();
              }}
              data-testid="lab-press"
            >
              <span className={styles.pressCap}>
                <span className={styles.pressTop}>Aperte para ouvir</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
