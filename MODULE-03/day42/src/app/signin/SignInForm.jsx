"use client";

import { useActionState } from "react";
import { signIn } from "@/actions";

const initialState = { status: 0, ok: false, error: null };

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signIn,
    initialState
  );

  return (
    <form action={formAction} className="checkout-form" noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="marta@addiseats.et"
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>

      {state.error && <span className="err">{state.error}</span>}

      <button type="submit" className="cta" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
