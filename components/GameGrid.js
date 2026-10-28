'use client';
import Link from 'next/link';
import { useState } from 'react';

const parse = (players) => players.split('-').map(Number);
const fits = (g, n) => { const [a, b = a] = parse(g.players); return n >= a && n <= b; };

// Oyun kartları: simge ve renk her oyunu tanıtır; "Kaç kişisiniz?" seçilirse uymayan oyunlar soluklaşır.
// href(g): oynanabilir oyunun adresi; null dönerse kart oynanamaz (etiket gösterilir).
export default function GameGrid({ games, hrefs, filter = true }) {
  const [n, setN] = useState(0);
  const playable = games.filter((g) => g.play);
  return (
    <>
      {filter && (
        <div className="gg-filter" role="group" aria-label="Kaç kişisiniz?">
          <span>Kaç kişisiniz?</span>
          <div>
            {[0, 2, 3, 4, 5, 6, 8].map((k) => (
              <button key={k} type="button" aria-pressed={n === k} className={n === k ? 'on' : ''} onClick={() => setN(k)}>{k === 0 ? 'Hepsi' : k === 8 ? '8+' : k}</button>
            ))}
          </div>
          {n > 0 && <small>{playable.filter((g) => fits(g, n)).length} oyun uygun</small>}
        </div>
      )}
      <ul className="gg">
        {games.map((g) => {
          const href = hrefs[g.id];
          const off = n > 0 && !fits(g, n);
          const body = (
            <>
              <i className="gg-ico" aria-hidden="true">{g.icon}</i>
              <span className="gg-tag">{g.tag}</span>
              <strong>{g.name}</strong>
              <span className="gg-note">{g.note}</span>
              <span className="gg-meta"><b>{g.players}</b> kişi · <b>{g.minutes}</b> dk</span>
              <span className="gg-cta">{href ? 'Oyna' : g.tableOnly ? 'Kafede masada' : 'Yakında'}</span>
            </>
          );
          return (
            <li key={g.id} className={`gg-card${href ? '' : g.tableOnly ? ' table' : ' soon'}${off ? ' off' : ''}`} style={{ '--gc': g.color }}>
              {href ? <Link href={href}>{body}</Link> : <div>{body}</div>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
