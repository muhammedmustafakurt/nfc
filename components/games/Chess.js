'use client';
import { useState } from 'react';
import { startBoard, legal, move, inCheck, hasMoves } from '@/lib/chess';

// ︎: telefonlarda taşların emoji değil metin olarak çizilmesi için
const GLYPH = { K: '♚︎', Q: '♛︎', R: '♜︎', B: '♝︎', N: '♞︎', P: '♟︎' };
const fresh = () => ({ board: startBoard(), turn: 'w', sel: null, over: null });

export default function Chess() {
  const [g, setG] = useState(fresh);
  const targets = g.sel ? legal(g.board, g.sel[0], g.sel[1]) : [];
  const check = !g.over && inCheck(g.board, g.turn);

  function click(y, x) {
    if (g.over) return;
    if (g.sel && targets.some(([a, c]) => a === y && c === x)) {
      const board = move(g.board, g.sel[0], g.sel[1], y, x);
      const turn = g.turn === 'w' ? 'b' : 'w';
      let over = null;
      if (!hasMoves(board, turn)) over = inCheck(board, turn) ? `Mat! ${g.turn === 'w' ? 'Beyaz' : 'Siyah'} kazandı.` : 'Pat: berabere.';
      setG({ board, turn, sel: null, over });
      return;
    }
    const p = g.board[y][x];
    setG({ ...g, sel: p && p[0] === g.turn ? [y, x] : null });
  }

  return (
    <div className="gm-box">
      <p role="status" className="gm-status">
        {g.over || `${g.turn === 'w' ? 'Beyaz' : 'Siyah'} oynuyor${check ? ' — şah!' : ''}`}
      </p>
      <div className="chess">
        {g.board.map((row, y) => row.map((p, x) => {
          const hit = targets.some(([a, c]) => a === y && c === x);
          const sel = g.sel && g.sel[0] === y && g.sel[1] === x;
          return (
            <button
              key={`${y}${x}`}
              className={`sq ${(y + x) % 2 ? 'dk' : 'lt'}${sel ? ' sel' : ''}${hit ? ' hit' : ''}`}
              onClick={() => click(y, x)}
              aria-label={p ? `${p[0] === 'w' ? 'Beyaz' : 'Siyah'} ${p[1]}` : 'Boş kare'}
            >
              {p && <span className={p[0] === 'w' ? 'pw' : 'pb'}>{GLYPH[p[1]]}</span>}
            </button>
          );
        }))}
      </div>
      <p className="muted">Rok ve geçerken alma yok. Piyon son sıraya ulaşınca vezir olur.</p>
      <button className="btn" onClick={() => setG(fresh())}>Yeni oyun</button>
    </div>
  );
}
