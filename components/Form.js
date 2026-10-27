'use client';
import { useActionState } from 'react';
import CopyButton from './CopyButton';

// Sunucu eylemini çalıştırıp hata/başarı mesajını gösteren ortak form.
// Eylem { code } da dönerse (ör. referans kodu) kopyalama düğmesiyle birlikte gösterilir;
// bu kod yalnızca o anda görünür.
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
      {state?.code && (
        <p className="once-code">
          <code>{state.code}</code> <CopyButton text={state.code} label="Kopyala" />
        </p>
      )}
    </form>
  );
}
