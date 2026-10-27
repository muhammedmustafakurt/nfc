// Satranç kuralları: rok, geçerken alma (en passant), şah/mat/pat; piyon sona ulaşınca vezir olur.
// Tahta 8x8 dizi: 'wP', 'bK' gibi, boş kare null. y=0 siyahın ilk sırası, y=7 beyazın ilk sırası.
//
// Hamle bağlamı (ctx): { castle: { wK, wQ, bK, bQ }, ep: [y, x] | null }
//   castle: o rok hâlâ yapılabilir mi (şah ya da kale oynamadıysa);
//   ep: bir önceki hamle piyon çift adımıysa, atlanan kare (geçerken alma hedefi).
const BACK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
const inb = (y, x) => y >= 0 && y < 8 && x >= 0 && x < 8;

export const ALL_CASTLE = { wK: true, wQ: true, bK: true, bQ: true };
const NOCTX = { castle: { wK: false, wQ: false, bK: false, bQ: false }, ep: null };

export const startBoard = () => [
  BACK.map((p) => 'b' + p),
  Array(8).fill('bP'),
  ...Array.from({ length: 4 }, () => Array(8).fill(null)),
  Array(8).fill('wP'),
  BACK.map((p) => 'w' + p),
];

// Eski kayıtlarda (rok/ep alanı yokken başlamış oyunlar) varsayılanlarla çalışır.
export const ctxOf = (g) => ({ castle: g.castle ?? ALL_CASTLE, ep: g.ep ?? null });

// Kendi şahını açıkta bırakma kuralına bakmadan taşın gidebileceği kareler (rok hariç).
export function pseudo(b, r, c, ctx = NOCTX) {
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
      // geçerken alma: rakibin az önce çift adım attığı piyonun atladığı kareye çapraz gidiş
      else if (!q && ctx.ep && ctx.ep[0] === r + dy && ctx.ep[1] === c + dx) out.push([r + dy, c + dx]);
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

// Hamleyi uygular. Şah iki kare giderse rok (kale de taşınır), piyon boş kareye çapraz giderse
// geçerken alma (atlanan piyon kaldırılır), piyon son sıraya ulaşırsa vezir olur.
export function move(b, fy, fx, ty, tx) {
  const nb = b.map((row) => row.slice());
  let p = nb[fy][fx];
  if (p[1] === 'K' && Math.abs(tx - fx) === 2) {
    const rx = tx > fx ? 7 : 0, nx = tx > fx ? 5 : 3;
    nb[fy][nx] = nb[fy][rx];
    nb[fy][rx] = null;
  }
  if (p[1] === 'P' && fx !== tx && !nb[ty][tx]) nb[fy][tx] = null;
  if (p[1] === 'P' && (ty === 0 || ty === 7)) p = p[0] + 'Q';
  nb[ty][tx] = p;
  nb[fy][fx] = null;
  return nb;
}

// Yasal hamleler: şahı açıkta bırakmayanlar + rok (şah tehdit altında değilse, geçtiği ve vardığı kare güvenliyse).
export function legal(b, y, x, ctx = NOCTX) {
  const p = b[y][x], col = p[0];
  const out = pseudo(b, y, x, ctx).filter(([ty, tx]) => !inCheck(move(b, y, x, ty, tx), col));
  if (p[1] === 'K' && x === 4 && y === (col === 'w' ? 7 : 0) && !inCheck(b, col)) {
    const safe = (tx) => !inCheck(move(b, y, x, y, tx), col);
    if (ctx.castle[col + 'K'] && b[y][7] === col + 'R' && !b[y][5] && !b[y][6] && safe(5) && safe(6)) out.push([y, 6]);
    if (ctx.castle[col + 'Q'] && b[y][0] === col + 'R' && !b[y][1] && !b[y][2] && !b[y][3] && safe(3) && safe(2)) out.push([y, 2]);
  }
  return out;
}

export function hasMoves(b, col, ctx = NOCTX) {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (b[y][x]?.[0] === col && legal(b, y, x, ctx).length) return true;
  return false;
}

// ---- Oyun durumu: tek telefonda da masada (sunucuda) da aynı işlevler kullanılır ----
const FILES = 'abcdefgh';
const NAMES = { w: 'Beyaz', b: 'Siyah' };

export const newGame = () => ({
  board: startBoard(), turn: 'w', over: null, draw: false, last: null,
  lost: { w: [], b: [] }, moves: [], castle: { ...ALL_CASTLE }, ep: null,
});

// Hamleyi doğrular ve uygular; geçersizse { error } döner. names: sonuç yazısında kullanılacak adlar.
export function play(g, fy, fx, ty, tx, names = NAMES) {
  if (g.over) return { error: 'Oyun bitti.' };
  const piece = g.board[fy]?.[fx];
  if (!piece || piece[0] !== g.turn) return { error: 'Bu taşı oynayamazsınız.' };
  const ctx = ctxOf(g);
  if (!legal(g.board, fy, fx, ctx).some(([a, b]) => a === ty && b === tx)) return { error: 'Geçersiz hamle.' };

  const col = piece[0], home = col === 'w' ? 7 : 0;
  const enPassant = piece[1] === 'P' && fx !== tx && !g.board[ty][tx];
  const taken = enPassant ? g.board[fy][tx] : g.board[ty][tx];
  const castling = piece[1] === 'K' && Math.abs(tx - fx) === 2;

  // rok hakları: şah ya da kale oynadıysa, ya da kale kendi köşesinde alındıysa kaybolur
  const castle = { ...ctx.castle };
  if (piece[1] === 'K') { castle[col + 'K'] = false; castle[col + 'Q'] = false; }
  if (piece[1] === 'R' && fy === home) { if (fx === 7) castle[col + 'K'] = false; if (fx === 0) castle[col + 'Q'] = false; }
  if (taken && taken[1] === 'R') {
    const eh = taken[0] === 'w' ? 7 : 0;
    if (ty === eh) { if (tx === 7) castle[taken[0] + 'K'] = false; if (tx === 0) castle[taken[0] + 'Q'] = false; }
  }
  const ep = piece[1] === 'P' && Math.abs(ty - fy) === 2 ? [(fy + ty) / 2, fx] : null;

  const board = move(g.board, fy, fx, ty, tx);
  const turn = g.turn === 'w' ? 'b' : 'w';
  let over = null, draw = false;
  if (!hasMoves(board, turn, { castle, ep })) {
    if (inCheck(board, turn)) over = `Şah mat! ${names[g.turn]} kazandı.`;
    else { over = 'Pat: berabere.'; draw = true; }
  }
  const text = castling ? (tx > fx ? 'O-O' : 'O-O-O') : `${FILES[fx]}${8 - fy}${taken ? '×' : '–'}${FILES[tx]}${8 - ty}${enPassant ? ' e.p.' : ''}`;
  return {
    board, turn, over, draw, last: [fy, fx, ty, tx], castle, ep,
    lost: taken ? { ...g.lost, [taken[0]]: [...g.lost[taken[0]], taken[1]] } : g.lost,
    moves: [...g.moves, text],
  };
}
