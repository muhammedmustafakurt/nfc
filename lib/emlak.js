// Emlak Krallığı'nın basit sürümü: aynı telefonda sırayla oynanır. 24 kareli tahta; ev/otel, takas ve ipotek yok.
// Tüm paralar bu çarpanla büyür (fiyat, kira, vergi, şans, Başlangıç primi, başlangıç parası); oran bozulmaz.
export const PARA_CARPANI = 100;
export const fmt = (n) => `₺${n.toLocaleString('tr-TR')}`;

const RAW = [
  { n: 'Başlangıç', t: 'go' },
  { n: 'Adana', t: 'p', price: 60, rent: 6 },
  { n: 'Mersin', t: 'p', price: 60, rent: 6 },
  { n: 'Konya', t: 'p', price: 100, rent: 10 },
  { n: 'Vergi', t: 'tax', amount: 100 },
  { n: 'Gaziantep', t: 'p', price: 120, rent: 12 },
  { n: 'Hapis', t: 'jail' },
  { n: 'Bursa', t: 'p', price: 140, rent: 14 },
  { n: 'Antalya', t: 'p', price: 160, rent: 16 },
  { n: 'Şans', t: 'chance' },
  { n: 'İzmir', t: 'p', price: 200, rent: 20 },
  { n: 'Eskişehir', t: 'p', price: 200, rent: 20 },
  { n: 'Otopark', t: 'park' },
  { n: 'Trabzon', t: 'p', price: 220, rent: 22 },
  { n: 'Samsun', t: 'p', price: 240, rent: 24 },
  { n: 'Şans', t: 'chance' },
  { n: 'Ankara', t: 'p', price: 280, rent: 28 },
  { n: 'Bodrum', t: 'p', price: 300, rent: 30 },
  { n: 'Hapse git', t: 'gojail' },
  { n: 'Vergi', t: 'tax', amount: 150 },
  { n: 'Boğaz', t: 'p', price: 350, rent: 40 },
  { n: 'Kapadokya', t: 'p', price: 380, rent: 45 },
  { n: 'Şans', t: 'chance' },
  { n: 'Nişantaşı', t: 'p', price: 400, rent: 50 },
];

export const TILES = RAW.map((t) => ({
  ...t,
  ...(t.price && { price: t.price * PARA_CARPANI, rent: t.rent * PARA_CARPANI }),
  ...(t.amount && { amount: t.amount * PARA_CARPANI }),
}));

export const COLORS = ['#2438e8', '#c0261e', '#1f9d6b', '#d98a00'];
// Masalarda 10 kişiye kadar oyuncu rengi (ilk dördü Emlak Krallığı taşlarıyla aynı).
export const PALETTE = [...COLORS, '#8a3fd1', '#0e8fa8', '#d6407f', '#5a6b1f', '#7a4b2a', '#3a4a7a'];
export const CHANCE = [50, 100, -50, -100].map((c) => c * PARA_CARPANI);
const GO_BONUS = 40 * PARA_CARPANI;
// Kira, mülk sahibinin sahip olduğu mülk sayısıyla artar (oyunun bitmesi için).
export const rentOf = (g, idx, o) => TILES[idx].rent * (1 + Object.values(g.owner).filter((x) => x === o).length);

export function newGame(count) {
  return {
    players: Array.from({ length: count }, (_, i) => ({ name: `Oyuncu ${i + 1}`, money: 1500 * PARA_CARPANI, pos: 0, skip: 0, out: false })),
    owner: {}, turn: 0, phase: 'roll', dice: null, winner: null, msg: 'Oyuncu 1 zar atsın.',
  };
}

function nextTurn(g) {
  const alive = g.players.filter((p) => !p.out);
  if (alive.length === 1) {
    g.winner = g.players.indexOf(alive[0]);
    g.msg = `${alive[0].name} kazandı!`;
    g.phase = 'over';
    return;
  }
  do g.turn = (g.turn + 1) % g.players.length; while (g.players[g.turn].out);
  g.phase = 'roll';
  g.msg = `${g.msg} ${g.players[g.turn].name} zar atsın.`;
}

function bankrupt(g, i, to) {
  const p = g.players[i];
  if (to !== undefined) g.players[to].money += Math.max(p.money, 0);
  p.out = true; p.money = 0;
  // İflas eden oyuncunun mülkleri alacaklıya geçer; masadan ayrılanın mülkleri boşalır.
  for (const k of Object.keys(g.owner)) if (g.owner[k] === i) { if (to !== undefined) g.owner[k] = to; else delete g.owner[k]; }
}

// Bedeli öder; yetmezse oyuncu iflas eder. İflas olduysa true döner.
function pay(g, i, amount, to) {
  const p = g.players[i];
  if (p.money >= amount) {
    p.money -= amount;
    if (to !== undefined) g.players[to].money += amount;
    return false;
  }
  p.money -= amount;
  bankrupt(g, i, to);
  return true;
}

export function roll(g, d1, d2, chanceIdx = 0) {
  const n = structuredClone(g), p = n.players[n.turn], me = n.turn;
  n.dice = [d1, d2];
  if (p.skip > 0) {
    p.skip--;
    n.msg = `${p.name} hapiste, bu tur oynamaz.`;
    nextTurn(n);
    return n;
  }
  const old = p.pos;
  p.pos = (old + d1 + d2) % TILES.length;
  if (p.pos < old) p.money += GO_BONUS;
  const tile = TILES[p.pos];
  n.msg = `${p.name} ${d1 + d2} attı: ${tile.n}.`;
  if (tile.t === 'p') {
    const o = n.owner[p.pos];
    if (o === undefined) {
      if (p.money >= tile.price) { n.phase = 'buy'; n.msg += ` Satın alınabilir (${fmt(tile.price)}).`; return n; }
      n.msg += ' Parası yetmiyor.';
    } else if (o !== me) {
      const rent = rentOf(n, p.pos, o);
      const broke = pay(n, me, rent, o);
      n.msg += ` ${n.players[o].name}'e ${fmt(rent)} kira${broke ? ' — iflas etti, mülkleri ' + n.players[o].name + "'e geçti!" : ''}.`;
    }
  } else if (tile.t === 'tax') {
    const broke = pay(n, me, tile.amount);
    n.msg += ` ${fmt(tile.amount)} vergi${broke ? ' — iflas etti!' : ''}.`;
  } else if (tile.t === 'chance') {
    const c = CHANCE[chanceIdx % CHANCE.length];
    if (c > 0) { p.money += c; n.msg += ` Şans: +${fmt(c)}.`; }
    else { const broke = pay(n, me, -c); n.msg += ` Şans: −${fmt(-c)}${broke ? ' — iflas etti!' : ''}.`; }
  } else if (tile.t === 'gojail') {
    p.pos = TILES.findIndex((t) => t.t === 'jail');
    p.skip = 1;
    n.msg += ' Hapse girdi, sonraki turu oynamaz.';
  }
  nextTurn(n);
  return n;
}

export function buy(g) {
  const n = structuredClone(g), p = n.players[n.turn], tile = TILES[p.pos];
  p.money -= tile.price;
  n.owner[p.pos] = n.turn;
  n.msg = `${p.name} ${tile.n}'ı aldı.`;
  nextTurn(n);
  return n;
}

export function skipBuy(g) {
  const n = structuredClone(g);
  n.msg = `${n.players[n.turn].name} almadı.`;
  nextTurn(n);
  return n;
}

// Oyuncu masadan ayrıldı: iflas etmiş sayılır, mülkleri boşalır. Tek oyuncu kalırsa o kazanır.
export function forfeit(g, i) {
  const n = structuredClone(g), p = n.players[i];
  if (p.out || n.phase === 'over') return n;
  bankrupt(n, i);
  n.msg = `${p.name} masadan ayrıldı.`;
  const alive = n.players.filter((x) => !x.out);
  if (alive.length <= 1) {
    n.phase = 'over';
    if (alive.length === 1) { n.winner = n.players.indexOf(alive[0]); n.msg += ` ${alive[0].name} kazandı!`; }
  } else if (n.turn === i) nextTurn(n);
  return n;
}
