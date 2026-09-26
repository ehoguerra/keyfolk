import type { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "../ui/Icon";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> {
  name: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
}

/** Labelled input with inline error wired through aria-invalid / aria-describedby. */
export function TextField({ name, label, error, hint, optional, className = "", ...input }: TextFieldProps) {
  const id = `f-${name}`;
  const describedBy = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional ? <span className="font-normal text-muted"> (opcional)</span> : null}
      </label>
      <input
        id={id}
        name={name}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
