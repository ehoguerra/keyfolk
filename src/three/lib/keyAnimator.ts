import type { Object3D } from "three";

/** Key travel when pressed (mm). */
export const KEY_TRAVEL = 3.5;

interface KeyState {
  pos: number;
  vel: number;
  target: number;
}

interface Scheduled {
  at: number;
  code: string;
  down: boolean;
}

/**
 * Tiny spring simulation for key presses, kept outside React so key events never re-render.
 * Positions are in millimetres; the owner applies `rest - pos` to each key group.
 */
export class KeyAnimator {
  private readonly nodes = new Map<string, { node: Object3D; rest: number }>();
  private readonly states = new Map<string, KeyState>();
  private readonly held = new Set<string>();
  private queue: Scheduled[] = [];
  private clock = 0;
  private listeners = new Set<() => void>();

  /** Called whenever something starts moving (so a demand frameloop can wake up). */
  listen(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  register(code: string, node: Object3D | null, rest: number): void {
    if (node) this.nodes.set(code, { node, rest });
    else this.nodes.delete(code);
  }

  has(code: string): boolean {
    return this.nodes.has(code);
  }

  press(code: string): void {
    if (!this.nodes.has(code)) return;
    this.held.add(code);
    this.state(code).target = KEY_TRAVEL;
    this.notify();
  }

  release(code: string): void {
    if (!this.nodes.has(code)) return;
    this.held.delete(code);
    this.state(code).target = 0;
    this.notify();
  }

  releaseAll(): void {
    for (const code of [...this.held]) this.release(code);
  }

  isHeld(code: string): boolean {
    return this.held.has(code);
  }

  /** Quick "wake up" ripple across the board, ordered by x position. */
  ripple(order: Array<{ code: string; x: number; y: number }>, speed = 0.022): void {
    const start = this.clock + 0.05;
    for (const { code, x, y } of order) {
      const at = start + (x + y * 0.35) * speed;
      this.queue.push({ at, code, down: true }, { at: at + 0.085, code, down: false });
    }
    this.queue.sort((a, b) => a.at - b.at);
    this.notify();
  }

  private state(code: string): KeyState {
    let s = this.states.get(code);
    if (!s) {
      s = { pos: 0, vel: 0, target: 0 };
      this.states.set(code, s);
    }
    return s;
  }

  /** Advances the simulation. Returns true while anything is still moving. */
  step(dt: number): boolean {
    this.clock += dt;
    while (this.queue.length && this.queue[0].at <= this.clock) {
      const ev = this.queue.shift()!;
      if (ev.down) this.state(ev.code).target = KEY_TRAVEL;
      else if (!this.held.has(ev.code)) this.state(ev.code).target = 0;
    }
    let active = this.queue.length > 0;
    const h = Math.min(dt, 1 / 30);
    const sub = 4;
    for (const [code, s] of this.states) {
      const pressing = s.target > s.pos;
      // Bottoming out is quick and stiff; the return is springy with a little overshoot.
      const k = pressing ? 5200 : 2300;
      const c = pressing ? 140 : 62;
      for (let i = 0; i < sub; i++) {
        const a = k * (s.target - s.pos) - c * s.vel;
        s.vel += a * (h / sub);
        s.pos += s.vel * (h / sub);
      }
      if (s.pos > KEY_TRAVEL) {
        s.pos = KEY_TRAVEL;
        s.vel = Math.min(0, s.vel);
      }
      const settled = Math.abs(s.target - s.pos) < 0.005 && Math.abs(s.vel) < 0.05;
      if (settled) {
        s.pos = s.target;
        s.vel = 0;
      } else active = true;
      const entry = this.nodes.get(code);
      if (entry) entry.node.position.y = entry.rest - s.pos;
    }
    return active;
  }
}
