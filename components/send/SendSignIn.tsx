'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/actions/followup';

export function SendSignIn({ passwordSet }: { passwordSet: boolean }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});

  if (!passwordSet || state.error === 'unset') {
    return (
      <p className="send__note" role="status">
        This page is locked until a password is set. In Vercel, open the project, then Settings → Environment
        Variables, add <code>SEND_PASSWORD</code> and redeploy.
      </p>
    );
  }

  return (
    <form className="form send__signin" action={action}>
      <label className="field">
        <span className="field__label">Password</span>
        <input name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {state.error === 'wrong' && (
        <p className="form__error" role="alert">
          That password is not right.
        </p>
      )}
      <div className="form__foot">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Open'}
        </button>
      </div>
    </form>
  );
}
