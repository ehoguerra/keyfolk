"use client";

import { useId, useState } from "react";
import { EmptyKeys } from "../ui/EmptyKeys";
import { Icon } from "../ui/Icon";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <div className="rounded-[28px] bg-surface p-6 md:sticky md:top-28 md:p-8">
      <EmptyKeys />
      <h2 className="display mt-6 text-[2rem]">Drops antes de todo mundo</h2>
      <p className="mt-3 text-muted">
        Um e-mail por mês com lotes novos, reposições e aquele colorway que esgota em dois dias. Sem spam.
      </p>
      {done ? (
        <p className="ui mt-6 flex items-start gap-2 rounded-[14px] bg-bg p-4" role="status">
          <Icon name="check" className="mt-0.5 shrink-0" />
          Pronto! O próximo drop chega em {email} antes de ir para o site.
        </p>
      ) : (
        <form
          noValidate
          className="mt-6 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!EMAIL.test(email.trim())) {
              setError("Esse e-mail parece incompleto. Confira se tem @ e um domínio, como nome@email.com.");
              return;
            }
            setError(null);
            setDone(true);
          }}
        >
          <label htmlFor={id} className="field-label">
            Seu e-mail
          </label>
          <input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="input"
            placeholder="voce@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-err` : undefined}
          />
          {error ? (
            <p id={`${id}-err`} className="field-error" role="alert">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary">
            Quero receber
          </button>
          <p className="text-xs text-muted">Demonstração: o e-mail não é enviado a lugar nenhum.</p>
        </form>
      )}
    </div>
  );
}
