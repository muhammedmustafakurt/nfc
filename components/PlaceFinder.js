'use client';
import { useState, useTransition } from 'react';
import { findPlaces } from '@/lib/place-actions';
import { shorten } from '@/lib/shortener-actions';
import CopyButton from './CopyButton';

export default function PlaceFinder() {
  const [places, setPlaces] = useState([]);
  const [shorts, setShorts] = useState({}); // id -> kısa link
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  function search(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await findPlaces(fd);
      if (r.error) { setError(r.error); setPlaces([]); return; }
      setError(''); setShorts({}); setPlaces(r.places);
    });
  }
  function makeShort(p) {
    const fd = new FormData();
    fd.set('url', p.link);
    start(async () => {
      const r = await shorten(fd);
      if (r.error) return setError(r.error);
      setError('');
      setShorts((s) => ({ ...s, [p.id]: r.short }));
    });
  }

  return (
    <>
      <form onSubmit={search} className="stack">
        <label>İşletme adı ve şehir <input name="q" type="text" autoComplete="off" placeholder="Kahve Evi Kadıköy İstanbul" required /></label>
        <button className="btn primary" type="submit" disabled={pending}>{pending ? 'Bekleyin…' : 'Ara'}</button>
        <p className="msg err" role="status">{error}</p>
      </form>
      {places.length > 0 && (
        <section className="short-list">
          <h2>Sonuçlar</h2>
          <ul>
            {places.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span className="short-orig">{p.address}</span>
                <span className="short-orig">Place ID: <code>{p.id}</code></span>
                <a className="short-new" href={shorts[p.id] || p.link} target="_blank" rel="noopener">{(shorts[p.id] || p.link).replace(/^https?:\/\//, '')}</a>
                <span className="short-act">
                  <CopyButton text={shorts[p.id] || p.link} label="Yorum linkini kopyala" />
                  <CopyButton text={p.id} label="Place ID kopyala" />
                  {!shorts[p.id] && <button type="button" className="btn sm" onClick={() => makeShort(p)} disabled={pending}>Kısa link yap</button>}
                </span>
              </li>
            ))}
          </ul>
          <p className="lead">Doğru işletmeyi adres ve ada bakarak seçin. Link, müşteriyi doğrudan o işletmenin yorum yazma ekranına götürür.</p>
        </section>
      )}
    </>
  );
}
