import type { PaymentId, ShippingId } from "./cart";

export interface PlacedOrder {
  number: string;
  total: number;
  payment: PaymentId;
  shipping: ShippingId;
  name: string;
  email: string;
  items: number;
  city: string;
  createdAt: string;
}

const KEY = "keyfolk-order";

export function createOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `KF-${n}`;
}

export function saveOrder(order: PlacedOrder): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // private mode / storage disabled: the success page shows a friendly fallback
  }
}

export function readOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

/** Raw snapshot string for useSyncExternalStore (stable between renders). */
export function readOrderRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
