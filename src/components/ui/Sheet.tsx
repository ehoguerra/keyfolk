"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left" | "top";
  labelledBy: string;
  className?: string;
  children: ReactNode;
  id?: string;
}

/**
 * Slide-over built on the native <dialog>: showModal() gives us the focus trap,
 * inert background and Esc handling for free. Focus returns to the trigger on close.
 */
export function Sheet({ open, onClose, side = "right", labelledBy, className = "", children, id }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      onCloseRef.current();
      const target = returnTo.current;
      returnTo.current = null;
      if (target && target.isConnected) target.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <dialog
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`sheet ${side === "left" ? "sheet-left" : side === "top" ? "sheet-top" : ""} ${className}`}
      onClick={(e) => {
        // Clicks on the backdrop land on the <dialog> element itself.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {children}
    </dialog>
  );
}
