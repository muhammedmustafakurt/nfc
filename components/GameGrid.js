'use client';
import Link from 'next/link';
import { useState } from 'react';
import GameArt from './GameArt';

const range = (g) => { const [a, b = a] = g.players.split('-').map(Number); return [a, b]; };
const fits = (g, n) => { const [a, b] = range(g); return n >= a && n <= b; };
// Her oyunun kutu sırtı rengi; açık renklerde koyu yazı kullanılır.
const SPINE = {
  monopoly: ['#2438e8', '#fff'], satranc: ['#1d2a5c', '#fff'], spyfall: ['#7a4b2a', '#fff'], ajanlar: ['#c0261e', '#fff'],
  vampir: ['#6b2fb0', '#fff'], tabu: ['#e0457f', '#fff'], kimim: ['#12a3bf', '#04202a'], cizim: ['#f2a900', '#2a1a00'],
  bil: ['#1f9d6b', '#fff'], catan: ['#8b5a2b', '#fff'], risk: ['#5a6b1f', '#fff'], cluedo: ['#6b2d5c', '#fff'],
  scrabble: ['#b5651d', '#fff'], ticket: ['#1d6fa5', '#fff'], carcassonne: ['#6f7d3a', '#fff'], azul: ['#2a6fb0', '#fff'],
};
const upper = (g) => Number(g.minutes.split('-').pop());

const SECTIONS = [
  { title: 'Bir çay içimi', sub: '10 dakikaya kadar', test: (m) => m <= 10 },
  { title: 'Bir kahve boyu', sub: '15–30 dakika', test: (m) => m > 10 && m <= 30 },
  { title: 'Bütün akşam', sub: 'uzun masalar', test: (m) => m > 30 },
];

// Kafe menüsü gibi liste: oyunlar süreye göre bölümlenir; "Kaç kişisiniz?" seçilince uymayanlar silikleşir.
// hrefs[id] varsa satır bağlantıdır; yoksa "Kafede masada" ya da "Yakında" görünür.
export default function GameGrid({ games, hrefs, filter = true }) {
  const [n, setN] = useState(0);
  const live = games.filter((g) => g.play);
  const soon = games.filter((g) => !g.play);

  const row = (g) => {
    const href = hrefs[g.id];
    const [a, b] = range(g);
    const body = (
      <>
        {g.play && <GameArt id={g.id} />}
        <strong>{g.name}</strong>
        <span className="num">{a === b ? a : `${a}–${b}`}<small>kişi · {g.minutes} dk</small></span>
        <span className="note">{g.note}</span>
        <span className={`go${href ? '' : ' dim'}`}>{href ? 'Oyna' : g.tableOnly ? 'Kafede masada' : 'Yakında'}</span>
      </>
    );
    return (
      <li key={g.id} className={`menu-row${g.play ? '' : ' soon'}${n > 0 && !fits(g, n) ? ' off' : ''}`} style={g.play ? { '--bg': SPINE[g.id]?.[0], '--fg': SPINE[g.id]?.[1] } : undefined}>
        {href ? <Link href={href}>{body}</Link> : <div>{body}</div>}
      </li>
    );
  };

  return (
    <>
      {filter && (
        <div className="menu-who" role="group" aria-label="Kaç kişisiniz?">
          <span>Kaç kişisiniz?</span>
          <div>
            {[0, 2, 3, 4, 5, 6, 8].map((k) => (
              <button key={k} type="button" aria-pressed={n === k} onClick={() => setN(k)}>{k === 0 ? 'fark etmez' : k === 8 ? '8+' : k}</button>
            ))}
          </div>
        </div>
      )}
      {SECTIONS.map((sec) => {
        const items = live.filter((g) => sec.test(upper(g)));
        if (items.length === 0) return null;
        return (
          <section key={sec.title} className="menu-sec">
            <h2>{sec.title} <small>{sec.sub}</small></h2>
            <ul>{items.map(row)}</ul>
          </section>
        );
      })}
      {soon.length > 0 && (
        <section className="menu-sec next">
          <h2>Rafta sıradakiler</h2>
          <ul>{soon.map(row)}</ul>
        </section>
      )}
    </>
  );
}
