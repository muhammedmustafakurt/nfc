'use client';
import { useEffect, useState } from 'react';
import { legal, inCheck, newGame, play } from '@/lib/chess';

const FILES = 'abcdefgh';
const NAME = { w: 'Beyaz', b: 'Siyah' };
const VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
const ORDER = ['Q', 'R', 'B', 'N', 'P'];
const IDX = [0, 1, 2, 3, 4, 5, 6, 7];

// Taş silüetleri (100x100). Dolgu/çizgi rengi CSS'ten gelir; .dt çizgileri iç detaydır (göz, yarık).
const BASE = <path d="M25 79h50a4 4 0 0 1 4 4v5H21v-5a4 4 0 0 1 4-4z" />;
const SHAPES = {
  P: <><circle cx="50" cy="31" r="12" /><path d="M39 76c0-15 5-23 11-25 6 2 11 10 11 25z" />{BASE}</>,
  R: <><path d="M28 24h10v8h8v-8h8v8h8v-8h10v22l-8 6v26H36V52l-8-6z" /><path className="dt" d="M36 52h28" />{BASE}</>,
  N: <><path d="M32 78c0-20 4-32 18-44l-6-9 9-5 6-9 3 12c14 8 16 28 14 55z" /><circle className="dt" cx="56" cy="35" r="2.4" /><path className="dt" d="M60 44c6 6 8 16 8 30" />{BASE}</>,
  B: <><path d="M50 15c11 9 17 22 8 36 5 5 8 14 8 28H34c0-14 3-23 8-28-9-14-3-27 8-36z" /><circle cx="50" cy="12" r="5" /><path className="dt" d="M45 33l9 9" />{BASE}</>,
  Q: <><path d="M30 44L23 22l16 12 11-20 11 20 16-12-7 22c3 14 2 24 0 34H30c-2-10-3-20 0-34z" /><circle cx="23" cy="20" r="4.5" /><circle cx="50" cy="12" r="4.5" /><circle cx="77" cy="20" r="4.5" />{BASE}</>,
  K: <><path d="M50 28c14 0 20 12 14 24 4 8 6 16 6 27H30c0-11 2-19 6-27-6-12 0-24 14-24z" /><path d="M46 5h8v8h8v8h-8v8h-8v-8h-8v-8h8z" />{BASE}</>,
};

function Piece({ type, color }) {
  return <svg viewBox="0 0 100 100" className={`pc pc-${color}`} aria-hidden="true">{SHAPES[type]}</svg>;
}

// Bir tarafın aldığı taşlar ve puan farkı.
function Bar({ color, g, names }) {
  const enemy = color === 'w' ? 'b' : 'w';
  const taken = [...g.lost[enemy]].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const diff = g.lost[enemy].reduce((s, t) => s + VAL[t], 0) - g.lost[color].reduce((s, t) => s + VAL[t], 0);
  return (
    <div className={`cx-bar${g.turn === color && !g.over ? ' on' : ''}`}>
      <span className="cx-who"><i className={`cx-av ${color}`} />{names[color]}</span>
      <span className="cx-tray" aria-label="Alınan taşlar">
        {taken.map((t, i) => <Piece key={i} type={t} color={enemy} />)}
      </span>
      {diff > 0 && <em className="cx-diff">+{diff}</em>}
    </div>
  );
}

// Tahta ve oyuncu çubukları. Tek telefonda da masada da kullanılır:
// flip: tahtayı Siyah altta olacak şekilde çevirir; canMove: bu telefon şu an hamle yapabilir mi;
// onMove(fy, fx, ty, tx): hamle isteği; onNew yoksa son ekranda düğme gösterilmez.
export function ChessBoard({ g, names = NAME, flip = false, canMove = true, onMove, onNew, newLabel = 'Yeni oyun', children }) {
  const [sel, setSel] = useState(null);
  useEffect(() => { setSel(null); }, [g.last, g.turn]);

  const targets = sel ? legal(g.board, sel[0], sel[1]) : [];
  const check = !g.over && inCheck(g.board, g.turn);
  let king = null;
  g.board.forEach((row, y) => row.forEach((p, x) => { if (p === g.turn + 'K') king = [y, x]; }));
  const ys = flip ? [...IDX].reverse() : IDX;
  const xs = flip ? [...IDX].reverse() : IDX;

  function click(y, x) {
    if (g.over || !canMove) return;
    if (sel && targets.some(([a, c]) => a === y && c === x)) {
      onMove(sel[0], sel[1], y, x);
      setSel(null);
      return;
    }
    const p = g.board[y][x];
    setSel(p && p[0] === g.turn ? [y, x] : null);
  }

  return (
    <div className="cx">
      <Bar color={flip ? 'w' : 'b'} g={g} names={names} />
      <div className="cx-board-wrap">
        <div className="cx-board" role="grid" aria-label="Satranç tahtası">
          {ys.map((y) => xs.map((x) => {
            const p = g.board[y][x];
            const hit = targets.some(([a, c]) => a === y && c === x);
            const isSel = sel && sel[0] === y && sel[1] === x;
            const last = g.last && ((g.last[0] === y && g.last[1] === x) || (g.last[2] === y && g.last[3] === x));
            const warn = check && king && king[0] === y && king[1] === x;
            return (
              <button
                key={`${y}${x}`}
                role="gridcell"
                className={`cx-sq ${(y + x) % 2 ? 'dk' : 'lt'}${isSel ? ' sel' : ''}${last ? ' last' : ''}${warn ? ' warn' : ''}`}
                onClick={() => click(y, x)}
                aria-label={`${FILES[x]}${8 - y}${p ? `, ${NAME[p[0]]} taş` : ''}`}
              >
                {x === xs[0] && <i className="cx-rank">{8 - y}</i>}
                {y === ys[7] && <i className="cx-file">{FILES[x]}</i>}
                {p && <Piece type={p[1]} color={p[0]} />}
                {hit && <b className={p ? 'cx-cap' : 'cx-dot'} />}
              </button>
            );
          }))}
        </div>
        {g.over && (
          <div className="cx-over" role="status">
            <div className="cx-trophy" aria-hidden="true">{g.draw ? '🤝' : '🏆'}</div>
            <p>{g.over}</p>
            {onNew && <button className="btn primary" onClick={onNew}>{newLabel}</button>}
          </div>
        )}
      </div>
      <Bar color={flip ? 'b' : 'w'} g={g} names={names} />

      <p className={`cx-status${check ? ' warn' : ''}`} role="status">
        {g.over ? g.over : `${names[g.turn]} oynuyor${check ? ' · şah!' : ''}`}
      </p>
      {children}
      {g.moves.length > 0 && (
        <ol className="cx-moves" aria-label="Hamleler">
          {g.moves.map((m, i) => <li key={i} className={i % 2 ? 'b' : 'w'}>{m}</li>)}
        </ol>
      )}
      <p className="muted cx-note">Rok ve geçerken alma yok. Piyon son sıraya ulaşınca vezir olur.</p>
    </div>
  );
}

// Tek telefonda sırayla oynanan kip.
export default function Chess() {
  const [s, setS] = useState(() => ({ g: newGame(), hist: [] }));
  const onMove = (fy, fx, ty, tx) => {
    const r = play(s.g, fy, fx, ty, tx);
    if (!r.error) setS({ g: r, hist: [...s.hist, s.g] });
  };
  const reset = () => setS({ g: newGame(), hist: [] });
  const undo = () => s.hist.length && setS({ g: s.hist[s.hist.length - 1], hist: s.hist.slice(0, -1) });
  return (
    <ChessBoard g={s.g} onMove={onMove} onNew={reset}>
      <div className="gm-row">
        <button className="btn" onClick={undo} disabled={!s.hist.length}>Geri al</button>
        <button className="btn" onClick={reset}>Yeni oyun</button>
      </div>
    </ChessBoard>
  );
}
