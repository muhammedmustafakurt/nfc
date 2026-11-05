'use client';
import { useState, useTransition } from 'react';
import { findPlaces } from '@/lib/place-actions';
import { shorten } from '@/lib/shortener-actions';
import CopyButton from './CopyButton';

// Her satırdaki Google Haritalar linkinden Place ID ve yorum linki çıkarır (API anahtarı yok).
export default function PlaceFinder() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  function run(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await findPlaces(fd);
      if (r.error) { setError(r.error); return; }
      setError(''); setRows(r.rows);
    });
  }
  function shortenAll() {
    start(async () => {
      const next = [];
      for (const r of rows) {
        if (r.link && !r.short) {
          const fd = new FormData(); fd.set('url', r.link);
          const s = await shorten(fd);
          next.push(s.short ? { ...r, short: s.short } : r);
        } else next.push(r);
      }
      setRows(next);
    });
  }

  const ok = rows.filter((r) => r.id);
  const best = (r) => r.short || r.link;
  const tsv = ok.map((r) => [r.name, r.id, best(r)].join('\t')).join('\n');

  return (
    <>
      <form onSubmit={run} className="stack">
        <label>Google Haritalar linkleri (her satıra bir işletme)
          <textarea name="links" rows={8} autoComplete="off" spellCheck={false} placeholder={'https://maps.app.goo.gl/abc123\nhttps://www.google.com/maps/place/Kahve+Evi/…'} required />
        </label>
        <button className="btn primary" type="submit" disabled={pending}>{pending ? 'Bekleyin…' : 'Yorum linklerini üret'}</button>
        <p className="msg err" role="status">{error}</p>
      </form>
      {rows.length > 0 && (
        <section className="short-list">
          <h2>Sonuçlar ({ok.length}/{rows.length})</h2>
          <span className="short-act" style={{ marginBottom: 12 }}>
            {ok.length > 0 && <CopyButton text={tsv} label="Hepsini kopyala (ad, Place ID, link)" />}
            {ok.length > 0 && <button type="button" className="btn sm" onClick={shortenAll} disabled={pending}>Hepsini kısalt</button>}
          </span>
          <ul>
            {rows.map((r, i) => (
              <li key={i} className={r.error ? 'short-bad' : undefined}>
                <strong>{r.name || (r.id ? 'İsimsiz işletme' : 'Hata')}</strong>
                <span className="short-orig" title={r.input}>Girilen: {r.input}</span>
                {r.error ? <span className="msg err">{r.error}</span> : (
                  <>
                    <span className="short-orig">Place ID: <code>{r.id}</code></span>
                    <a className="short-new" href={best(r)} target="_blank" rel="noopener">{best(r).replace(/^https?:\/\//, '')}</a>
                    <span className="short-act">
                      <CopyButton text={best(r)} label="Linki kopyala" />
                      <CopyButton text={r.id} label="Place ID kopyala" />
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
