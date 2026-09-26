import type { SwitchType } from "@/data/products";

/**
 * Synthesized key sounds (no audio files): a short filtered noise burst for the
 * plastic "clack" plus a low sine body for the "thock". Created lazily on first use.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const c = new Ctor();
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master = c.createGain();
  master.gain.value = 0.28;
  master.connect(comp);
  comp.connect(c.destination);
  const len = Math.floor(c.sampleRate * 0.3);
  noise = c.createBuffer(1, len, c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return c;
}

/** Call from a user gesture (e.g. the sound toggle) so the context can start. */
export function unlockAudio(): void {
  if (!ctx) ctx = createContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

interface Profile {
  body: number;
  bodyDecay: number;
  noiseType: BiquadFilterType;
  noiseFreq: number;
  noiseQ: number;
  noiseDecay: number;
  click: number;
  level: number;
}

const PROFILES: Record<SwitchType, Profile> = {
  // deeper, rounder
  linear: { body: 112, bodyDecay: 0.1, noiseType: "lowpass", noiseFreq: 1250, noiseQ: 0.7, noiseDecay: 0.05, click: 0, level: 1 },
  // mid, a little papery bump
  tatil: { body: 165, bodyDecay: 0.075, noiseType: "bandpass", noiseFreq: 2300, noiseQ: 1.1, noiseDecay: 0.042, click: 0.35, level: 0.95 },
  // extra bright transient
  clicky: { body: 205, bodyDecay: 0.06, noiseType: "bandpass", noiseFreq: 3600, noiseQ: 0.9, noiseDecay: 0.034, click: 1, level: 0.9 },
};

function burst(c: AudioContext, at: number, type: BiquadFilterType, freq: number, q: number, gain: number, decay: number) {
  if (!noise || !master) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.0015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  src.connect(filter).connect(g).connect(master);
  src.start(at, Math.random() * 0.15, decay + 0.02);
}

export interface ThockOptions {
  /** Key release (softer, higher). */
  up?: boolean;
  /** Stabilized keys (space, shift…) sound lower and longer. */
  big?: boolean;
}

export function playThock(profile: SwitchType, { up = false, big = false }: ThockOptions = {}): void {
  if (!ctx) ctx = createContext();
  if (!ctx || !master) return;
  if (ctx.state === "suspended") void ctx.resume();
  const c = ctx;
  const p = PROFILES[profile];
  const t = c.currentTime + 0.003;
  const vary = 1 + (Math.random() - 0.5) * 0.1;
  const level = (up ? 0.32 : 1) * p.level * (0.9 + Math.random() * 0.2);

  // Body: short sine with a quick pitch drop.
  const osc = c.createOscillator();
  osc.type = "sine";
  const f = p.body * vary * (big ? 0.74 : 1) * (up ? 1.45 : 1);
  osc.frequency.setValueAtTime(f * 1.7, t);
  osc.frequency.exponentialRampToValueAtTime(f, t + 0.012);
  osc.frequency.exponentialRampToValueAtTime(f * 0.72, t + p.bodyDecay);
  const og = c.createGain();
  const bodyDecay = p.bodyDecay * (big ? 1.5 : 1);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.6 * level, t + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, t + bodyDecay);
  osc.connect(og).connect(master);
  osc.start(t);
  osc.stop(t + bodyDecay + 0.05);

  // Plastic clack.
  burst(c, t, p.noiseType, p.noiseFreq * vary * (up ? 1.35 : 1) * (big ? 0.8 : 1), p.noiseQ, 0.75 * level, p.noiseDecay);

  // Tactile bump / clicky jacket: a bright tick just before bottom-out.
  if (p.click > 0 && !up) {
    burst(c, t - 0.001, "highpass", 5200 * vary, 0.8, 0.9 * p.click * level, 0.012 + 0.006 * p.click);
  }
  if (profile === "clicky" && up) {
    burst(c, t, "highpass", 6000 * vary, 0.8, 0.35 * level, 0.01);
  }
}
