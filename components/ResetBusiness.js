'use client';
import { useActionState } from 'react';
import CopyButton from './CopyButton';

// Tablodaki satır düğmesi: yeni referans kodu üretir ve yalnızca bu yanıtta gösterir.
export default function ResetBusiness({ action, id, label, title }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <button className="btn sm" title={title} disabled={pending}>{pending ? 'Bekleyin…' : label}</button>
      </form>
      {state?.code && (
        <p className="once-code row-code">
          Yeni kod (yalnızca şimdi görünür): <code>{state.code}</code> <CopyButton text={state.code} label="Kopyala" />
        </p>
      )}
    </>
  );
}
