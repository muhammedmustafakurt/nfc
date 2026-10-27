'use client';
import { useState } from 'react';

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

// variant="icon": bilginin yanındaki kare kopyala düğmesi (kart sayfası);
// varsayılan: yönetim tablosundaki küçük yazılı düğme.
export default function CopyButton({ text, label = 'Kopyala', variant }) {
  const [state, setState] = useState(null); // null | 'ok' | 'fail'
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('ok');
    } catch {
      setState('fail');
    }
    setTimeout(() => setState(null), 1800);
  }

  if (variant === 'icon') {
    return (
      <>
        <button type="button" className="icon-btn" data-done={state === 'ok'} aria-label={label} title={label} onClick={copy}>
          {state === 'ok' ? <CheckIcon /> : <CopyIcon />}
          <span aria-hidden="true">{state === 'ok' ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
        <span className="sr-only" role="status">{state === 'ok' ? 'Kopyalandı' : state === 'fail' ? 'Kopyalanamadı' : ''}</span>
      </>
    );
  }
  return (
    <button type="button" className="btn sm" onClick={copy}>
      {state === 'ok' ? 'Kopyalandı ✓' : state === 'fail' ? 'Kopyalanamadı' : label}
    </button>
  );
}
