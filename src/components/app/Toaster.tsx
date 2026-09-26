"use client";

import Link from "next/link";
import { useUi } from "@/store/ui";
import { Icon } from "../ui/Icon";

const actionClass = "ui shrink-0 rounded-lg px-2.5 py-2 text-sm underline underline-offset-4 hover:bg-white/10";

/** Visual toasts + a polite live region for screen readers. */
export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismiss);
  const announcement = useUi((s) => s.announcement);
  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="live-region">
        {announcement}
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid="toast"
            className="toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[14px] bg-ink py-2.5 pl-3 pr-2 text-bg shadow-[0_18px_40px_-16px_var(--shadow-color)]"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-legend">
              <Icon name="check" size={16} strokeWidth={2.4} />
            </span>
            <p className="ui flex-1 text-[0.9375rem]">{t.message}</p>
            {t.action?.href ? (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className={actionClass}>
                {t.action.label}
              </Link>
            ) : t.action?.onClick ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  dismiss(t.id);
                }}
                className={actionClass}
              >
                {t.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="grid size-9 shrink-0 place-items-center rounded-lg opacity-70 hover:bg-white/10 hover:opacity-100"
              aria-label="Fechar aviso"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
