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

// Mülklerin renk grupları (aynı renkteki iki mülk bir grup) ve özel karelerin simgeleri.
const BAND = { 1: '#8b5a2b', 2: '#8b5a2b', 3: '#4fb3e8', 5: '#4fb3e8', 7: '#e0559b', 8: '#e0559b', 10: '#f08a24', 11: '#f08a24', 13: '#d64545', 14: '#d64545', 16: '#e8c230', 17: '#e8c230', 20: '#2e9e5b', 21: '#2e9e5b', 23: '#1d2a8f' };
const ICON = { go: '🏁', jail: '🔒', park: '🅿️', gojail: '👮', tax: '💸', chance: '❓' };
const FACE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

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
  return (
    <div className="gm-box">
      <div className="mono-board">
        {TILES.map((t, i) => {
          const [r, c] = cell(i);
          const o = g.owner[i];
          const active = g.phase !== 'over' && g.players[g.turn].pos === i;
          return (
            <div
              key={i}
              className={`mono-tile ${t.t}${o !== undefined ? ' owned' : ''}${active ? ' active' : ''}`}
              style={{ gridRow: r + 1, gridColumn: c + 1, '--own': o !== undefined ? COLORS[o] : undefined }}
            >
              {BAND[i] && <b className="band" style={{ background: BAND[i] }} />}
              {ICON[t.t] && <em className="ico">{ICON[t.t]}</em>}
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
          {g.dice && (
            <p className="mono-dice" key={`${g.dice}${g.turn}${g.msg}`} aria-label={`Zar: ${g.dice[0]} ve ${g.dice[1]}`}>
              <span className="die">{FACE[g.dice[0] - 1]}</span><span className="die">{FACE[g.dice[1] - 1]}</span>
            </p>
          )}
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
            <i style={{ background: COLORS[k] }} />
            <span className="pn">{p.name}{k === g.turn && g.phase !== 'over' ? ' · sıra sizde' : ''}</span>
            <span className="pm">{p.out ? 'iflas' : `₺${p.money}`}<small>{Object.values(g.owner).filter((x) => x === k).length} mülk</small></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
