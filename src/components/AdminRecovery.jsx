"use client";

import { useActionState, useEffect, useRef } from "react";
import { recoverPasswordAction } from "@/app/admin/actions";

export default function AdminRecovery() {
  const [state, formAction, pending] = useActionState(
    recoverPasswordAction,
    null,
  );
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <details className="admin-recovery">
      <summary className="admin-recovery__toggle">Unustasid parooli?</summary>
      <form action={formAction} className="admin-recovery__form" ref={formRef}>
        <p className="admin-field__hint">
          Sisesta serveris hoitav taastevõti ja määra uus parool.
        </p>
        <label className="admin-field">
          <span className="admin-field__label">Taastevõti</span>
          <input
            autoComplete="off"
            className="admin-input"
            name="key"
            required
            spellCheck={false}
            type="password"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Uus parool (vähemalt 8 märki)</span>
          <input
            autoComplete="new-password"
            className="admin-input"
            minLength={8}
            name="next"
            required
            type="password"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field__label">Uus parool uuesti</span>
          <input
            autoComplete="new-password"
            className="admin-input"
            minLength={8}
            name="confirm"
            required
            type="password"
          />
        </label>
        <button className="cta cta--ghost" disabled={pending} type="submit">
          {pending ? "Taastan…" : "Määra uus parool"}
        </button>
        {state ? (
          <p
            className={`admin-status ${state.ok ? "admin-status--ok" : "admin-status--error"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </details>
  );
}
