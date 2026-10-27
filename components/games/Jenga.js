'use client';
import { useState } from 'react';

const fresh = () => ({ layers: Array.from({ length: 12 }, () => [true, true, true]), turn: 0, pulled: 0, over: null });

// Çekilen blok kuleyi ne kadar sallar: üstteki katlar, kenar bloklar ve boşalan katlar riski artırır.
function risk(g, li, bi) {
  const layer = g.layers[li];
  const left = layer.filter((b, k) => b && k !== bi);
  let r = 0.03 + g.pulled * 0.012;
  if (bi !== 1) r += 0.05;
  if (li >= g.layers.length - 3) r += 0.08;
  if (left.length === 0) r += 0.6;
  else if (left.length === 1 && !layer[1]) r += 0.45;
  return Math.min(r, 0.95);
}

export default function Jenga() {
  const [g, setG] = useState(fresh);
  const top = g.layers.length - 1;

  function pull(li, bi) {
    if (g.over || li === top || !g.layers[li][bi]) return;
    if (Math.random() < risk(g, li, bi)) {
      setG({ ...g, over: `Oyuncu ${g.turn + 1} kuleyi yıktı! Oyuncu ${2 - g.turn} kazandı.` });
      return;
    }
    const layers = g.layers.map((l) => l.slice());
    layers[li][bi] = false;
    if (layers[top].every(Boolean)) layers.push([false, false, false]);
    const last = layers[layers.length - 1];
    last[last.indexOf(false)] = true;
    setG({ layers, turn: 1 - g.turn, pulled: g.pulled + 1, over: null });
  }

  return (
    <div className="gm-box">
      <p role="status" className="gm-status">{g.over || `Oyuncu ${g.turn + 1}, bir blok çekin.`}</p>
      <div className="jenga">
        {g.layers.map((l, li) => (
          <div key={li} className={`jl${li % 2 ? ' alt' : ''}`}>
            {l.map((has, bi) => {
              const lvl = has && li !== top && !g.over ? risk(g, li, bi) : 0;
              return (
                <button
                  key={bi}
                  className={`jb${has ? '' : ' gone'}${lvl > 0.35 ? ' high' : lvl > 0.12 ? ' mid' : ''}`}
                  disabled={!has || li === top || !!g.over}
                  onClick={() => pull(li, bi)}
                  aria-label={`${li + 1}. kat, ${bi + 1}. blok`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="muted">Renk riski gösterir: koyu kırmızı çok riskli. En üst kattan blok çekilmez.</p>
      <button className="btn" onClick={() => setG(fresh())}>Yeni oyun</button>
    </div>
  );
}
