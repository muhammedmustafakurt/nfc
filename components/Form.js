'use client';
import { useActionState } from 'react';

// Sunucu eylemini çalıştırıp hata/başarı mesajını gösteren ortak form.
export default function Form({ action, submit, children }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="stack">
      {children}
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? 'Bekleyin…' : submit}
      </button>
      <p className={`msg ${state?.error ? 'err' : 'ok'}`} role="status">
        {state?.error || state?.ok || ''}
      </p>
    </form>
  );
}
