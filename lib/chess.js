// Satranç kuralları (rok ve geçerken alma yok; piyon sona ulaşınca vezir olur).
const BACK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
const inb = (y, x) => y >= 0 && y < 8 && x >= 0 && x < 8;

export const startBoard = () => [
  BACK.map((p) => 'b' + p),
  Array(8).fill('bP'),
  ...Array.from({ length: 4 }, () => Array(8).fill(null)),
  Array(8).fill('wP'),
  BACK.map((p) => 'w' + p),
];

// Kendi şahını açıkta bırakma kuralına bakmadan taşın gidebileceği kareler.
export function pseudo(b, r, c) {
  const p = b[r][c];
  const col = p[0], t = p[1], out = [];
  const add = (y, x) => {
    if (!inb(y, x)) return false;
    const q = b[y][x];
    if (q && q[0] === col) return false;
    out.push([y, x]);
    return !q;
  };
  const slide = (ds) => {
    for (const [dy, dx] of ds) {
      let y = r + dy, x = c + dx;
      while (add(y, x)) { y += dy; x += dx; }
    }
  };
  const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  if (t === 'N') for (const [dy, dx] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) add(r + dy, c + dx);
  else if (t === 'K') for (const [dy, dx] of [...ROOK, ...BISHOP]) add(r + dy, c + dx);
  else if (t === 'R') slide(ROOK);
  else if (t === 'B') slide(BISHOP);
  else if (t === 'Q') slide([...ROOK, ...BISHOP]);
  else {
    const dy = col === 'w' ? -1 : 1;
    const home = col === 'w' ? 6 : 1;
    if (inb(r + dy, c) && !b[r + dy][c]) {
      out.push([r + dy, c]);
      if (r === home && !b[r + 2 * dy][c]) out.push([r + 2 * dy, c]);
    }
    for (const dx of [-1, 1]) {
      const q = inb(r + dy, c + dx) && b[r + dy][c + dx];
      if (q && q[0] !== col) out.push([r + dy, c + dx]);
    }
  }
  return out;
}

export function inCheck(b, col) {
  let ky = -1, kx = -1;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (b[y][x] === col + 'K') { ky = y; kx = x; }
  const en = col === 'w' ? 'b' : 'w';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const p = b[y][x];
      if (!p || p[0] !== en) continue;
      if (p[1] === 'P') {
        const dy = en === 'w' ? -1 : 1;
        if (y + dy === ky && Math.abs(x - kx) === 1) return true;
      } else if (pseudo(b, y, x).some(([a, c]) => a === ky && c === kx)) return true;
    }
  }
  return false;
}

export function move(b, fy, fx, ty, tx) {
  const nb = b.map((row) => row.slice());
  let p = nb[fy][fx];
  if (p[1] === 'P' && (ty === 0 || ty === 7)) p = p[0] + 'Q';
  nb[ty][tx] = p;
  nb[fy][fx] = null;
  return nb;
}

export const legal = (b, y, x) =>
  pseudo(b, y, x).filter(([ty, tx]) => !inCheck(move(b, y, x, ty, tx), b[y][x][0]));

export function hasMoves(b, col) {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (b[y][x]?.[0] === col && legal(b, y, x).length) return true;
  return false;
}

// ---- Oyun durumu: tek telefonda da masada (sunucuda) da aynı işlevler kullanılır ----
const FILES = 'abcdefgh';
const NAMES = { w: 'Beyaz', b: 'Siyah' };

export const newGame = () => ({ board: startBoard(), turn: 'w', over: null, draw: false, last: null, lost: { w: [], b: [] }, moves: [] });

// Hamleyi doğrular ve uygular; geçersizse { error } döner. names: sonuç yazısında kullanılacak adlar.
export function play(g, fy, fx, ty, tx, names = NAMES) {
  if (g.over) return { error: 'Oyun bitti.' };
  const piece = g.board[fy]?.[fx];
  if (!piece || piece[0] !== g.turn) return { error: 'Bu taşı oynayamazsınız.' };
  if (!legal(g.board, fy, fx).some(([a, b]) => a === ty && b === tx)) return { error: 'Geçersiz hamle.' };
  const taken = g.board[ty][tx];
  const board = move(g.board, fy, fx, ty, tx);
  const turn = g.turn === 'w' ? 'b' : 'w';
  let over = null, draw = false;
  if (!hasMoves(board, turn)) {
    if (inCheck(board, turn)) over = `Şah mat! ${names[g.turn]} kazandı.`;
    else { over = 'Pat: berabere.'; draw = true; }
  }
  return {
    board, turn, over, draw, last: [fy, fx, ty, tx],
    lost: taken ? { ...g.lost, [taken[0]]: [...g.lost[taken[0]], taken[1]] } : g.lost,
    moves: [...g.moves, `${FILES[fx]}${8 - fy}${taken ? '×' : '–'}${FILES[tx]}${8 - ty}`],
  };
}
