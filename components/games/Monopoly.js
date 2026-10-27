'use client';
import { useState } from 'react';
import { TILES, COLORS, newGame, roll, buy, skipBuy } from '@/lib/emlak';

// Tahtanın kenarı boyunca 7x7 ızgarada saat yönünde yerleşim (0. kare sağ alt köşe).
function cell(i) {
  if (i <= 6) return [6, 6 - i];
  if (i <= 12) return [12 - i, 0];
  if (i <= 18) return [0, i - 12];
  return [i - 18, 6];
}

const die = () => 1 + Math.floor(Math.random() * 6);

export default function Monopoly() {
  const [g, setG] = useState(null);
  if (!g) {
    return (
      <div className="gm-box">
        <p>Aynı telefonda sırayla oynanır. Kaç kişisiniz?</p>
        <div className="gm-row">
          {[2, 3, 4].map((n) => <button key={n} className="btn primary" onClick={() => setG(newGame(n))}>{n} kişi</button>)}
        </div>
      </div>
    );
  }
  const cur = g.players[g.turn];
  return (
    <div className="gm-box">
      <div className="mono-board">
        {TILES.map((t, i) => {
          const [r, c] = cell(i);
          const o = g.owner[i];
          return (
            <div key={i} className={`mono-tile ${t.t}`} style={{ gridRow: r + 1, gridColumn: c + 1, borderColor: o !== undefined ? COLORS[o] : undefined }}>
              <span>{t.n}</span>
              {t.price && <small>₺{t.price}</small>}
              <div className="mono-tokens">
                {g.players.map((p, k) => !p.out && p.pos === i && <i key={k} style={{ background: COLORS[k] }} />)}
              </div>
            </div>
          );
        })}
        <div className="mono-center">
          <p role="status">{g.msg}</p>
          {g.dice && <p className="mono-dice">🎲 {g.dice[0]} + {g.dice[1]}</p>}
          {g.phase === 'roll' && <button className="btn primary" onClick={() => setG(roll(g, die(), die(), Math.floor(Math.random() * 4)))}>Zar at</button>}
          {g.phase === 'buy' && (
            <div className="gm-row">
              <button className="btn primary" onClick={() => setG(buy(g))}>Satın al</button>
              <button className="btn" onClick={() => setG(skipBuy(g))}>Geç</button>
            </div>
          )}
          {g.phase === 'over' && <button className="btn primary" onClick={() => setG(null)}>Yeni oyun</button>}
        </div>
      </div>
      <ul className="mono-players">
        {g.players.map((p, k) => (
          <li key={k} className={k === g.turn && g.phase !== 'over' ? 'on' : undefined} style={{ opacity: p.out ? 0.4 : 1 }}>
            <i style={{ background: COLORS[k] }} /> {p.name}: ₺{p.money}{p.out ? ' (iflas)' : ''}
          </li>
        ))}
      </ul>
      {g.phase !== 'over' && <p className="muted">Sıra: {cur.name}</p>}
    </div>
  );
}
