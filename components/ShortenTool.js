'use client';
import { useEffect, useState, useTransition } from 'react';
import { shorten } from '@/lib/shortener-actions';
import CopyButton from './CopyButton';

const KEY = 'nfc-short-links';

// Her kısaltma, uzun adresiyle birlikte bu tarayıcıdaki listeye eklenir (en yenisi üstte).
export default function ShortenTool() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY)) || []); } catch {}
  }, []);
  const save = (next) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next.slice(0, 200))); } catch {}
  };

  function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const r = await shorten(fd);
      if (r.error) return setError(r.error);
      setError('');
      save([{ url: r.url, short: r.short, code: r.code, at: Date.now() }, ...items.filter((i) => i.short !== r.short)]);
      form.reset();
    });
  }

  return (
    <>
      <form onSubmit={submit} className="stack">
        <label>Uzun link <input name="url" type="text" inputMode="url" autoComplete="off" placeholder="https://ornek.com/uzun/adres" required /></label>
        <label>Kısa link adı (isteğe bağlı) <input name="alias" type="text" autoComplete="off" placeholder="ör. menu" maxLength={32} /></label>
        <button className="btn primary" type="submit" disabled={pending}>{pending ? 'Bekleyin…' : 'Kısalt'}</button>
        <p className="msg err" role="status">{error}</p>
      </form>
      {items.length > 0 && (
        <section className="short-list">
          <h2>Linklerim</h2>
          <ul>
            {items.map((i) => (
              <li key={i.short}>
                <a className="short-new" href={i.short} target="_blank" rel="noopener">{i.short.replace(/^https?:\/\//, '')}</a>
                <span className="short-orig" title={i.url}>→ {i.url}</span>
                <span className="short-act">
                  <CopyButton text={i.short} label="Kopyala" />
                  <button type="button" className="btn sm" onClick={() => save(items.filter((x) => x.short !== i.short))}>Listeden kaldır</button>
                </span>
              </li>
            ))}
          </ul>
          <p className="lead">Bu liste yalnızca bu cihazda saklanır. Kaldırmak kısa linki silmez.</p>
        </section>
      )}
    </>
  );
}
