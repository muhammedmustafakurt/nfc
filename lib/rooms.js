// Kafe masası odaları: bir (kafe, masa, oyun) için tek oda. Oyun kuralları ve zarlar sunucuda işlenir;
// telefonlar yalnızca kendi sırasında hamle isteyebilir. Durum veritabanında tutulur (sunucusuz ortamda
// bellek paylaşılmadığı için), istemciler kısa aralıkla sürüm numarasını sorar.
import { get, run } from './db';
import * as E from './emlak';

export const ROOM_GAMES = new Set(['monopoly']);
export const MASA_RE = /^masa-\d{1,3}$/;
export const PID_RE = /^[a-zA-Z0-9]{16,64}$/;
const MAX_SEATS = 4;
const STALE_MS = 6 * 60 * 60 * 1000; // 6 saat işlem görmeyen oda sıfırlanır

const fresh = () => ({ phase: 'lobby', seats: [], game: null });
const clean = (n) => String(n ?? '').replace(/[<>]/g, '').trim().slice(0, 16);
const die = () => 1 + Math.floor(Math.random() * 6);

export const findCafe = (slug) => get('SELECT id, name FROM businesses WHERE slug = ?', slug);

const SELECT = 'SELECT id, state, version, updated_at FROM game_rooms WHERE biz_id = ? AND tbl = ? AND game = ?';

export async function readRoom(biz, tbl, game) {
  let r = await get(SELECT, biz, tbl, game);
  if (!r) {
    await run(
      'INSERT INTO game_rooms (biz_id, tbl, game, state, version, updated_at) VALUES (?, ?, ?, ?, 0, ?) ON CONFLICT (biz_id, tbl, game) DO NOTHING',
      biz, tbl, game, JSON.stringify(fresh()), Date.now(),
    );
    r = await get(SELECT, biz, tbl, game);
  }
  const stale = Date.now() - Number(r.updated_at) > STALE_MS;
  return { id: r.id, version: r.version, state: stale ? fresh() : JSON.parse(r.state) };
}

// İstemciye giden görünüm: başkalarının kimlik kodları (pid) gönderilmez.
export function view(room, pid) {
  const s = room.state;
  return {
    version: room.version,
    phase: s.phase,
    seats: s.seats.map((x) => ({ name: x.name, left: !!x.left })),
    me: s.seats.findIndex((x) => x.pid === pid),
    game: s.game,
  };
}

function apply(s, pid, a) {
  const idx = s.seats.findIndex((x) => x.pid === pid);
  const g = s.game;
  switch (a.type) {
    case 'join': {
      if (idx >= 0) {
        s.seats[idx].name = clean(a.name) || s.seats[idx].name;
        return { state: s };
      }
      if (s.phase !== 'lobby') return { error: 'Oyun başladı, bu oyuna sonradan katılınamaz. İzleyebilirsiniz.' };
      if (s.seats.length >= MAX_SEATS) return { error: `Masa dolu (en fazla ${MAX_SEATS} kişi).` };
      s.seats.push({ pid, name: clean(a.name) || `Oyuncu ${s.seats.length + 1}` });
      return { state: s };
    }
    case 'leave': {
      if (idx < 0) return { state: s };
      if (s.phase === 'lobby') s.seats.splice(idx, 1);
      else { s.seats[idx].left = true; s.game = E.forfeit(g, idx); }
      return { state: s };
    }
    case 'start': {
      if (idx !== 0 || s.phase !== 'lobby') return { error: 'Oyunu yalnızca masayı ilk açan kişi başlatabilir.' };
      if (s.seats.length < 2) return { error: 'Başlamak için en az 2 kişi gerekir.' };
      const ng = E.newGame(s.seats.length);
      ng.players.forEach((p, i) => { p.name = s.seats[i].name; });
      ng.msg = `${ng.players[0].name} zar atsın.`;
      s.game = ng;
      s.phase = 'play';
      return { state: s };
    }
    case 'roll':
    case 'buy':
    case 'skip': {
      if (s.phase !== 'play' || idx < 0) return { error: 'Oyunda değilsiniz.' };
      if (g.turn !== idx) return { error: 'Sıra sizde değil.' };
      const need = a.type === 'roll' ? 'roll' : 'buy';
      if (g.phase !== need) return { error: 'Şu an bu hamle yapılamaz.' };
      s.game = a.type === 'roll'
        ? E.roll(g, die(), die(), Math.floor(Math.random() * 4))
        : a.type === 'buy' ? E.buy(g) : E.skipBuy(g);
      return { state: s };
    }
    case 'reset': {
      if (idx < 0 || s.phase !== 'play' || g.phase !== 'over') return { error: 'Oyun henüz bitmedi.' };
      s.seats = s.seats.filter((x) => !x.left);
      s.phase = 'lobby';
      s.game = null;
      return { state: s };
    }
    default:
      return { error: 'Bilinmeyen işlem.' };
  }
}

// Hamleyi uygular; aynı anda iki telefon yazarsa sürüm denetimiyle yeniden dener.
export async function mutate(biz, tbl, game, pid, action) {
  for (let i = 0; i < 4; i++) {
    const r = await readRoom(biz, tbl, game);
    const res = apply(structuredClone(r.state), pid, action);
    if (res.error) return { error: res.error, room: r };
    const ok = await get(
      'UPDATE game_rooms SET state = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ? RETURNING version',
      JSON.stringify(res.state), Date.now(), r.id, r.version,
    );
    if (ok) return { room: { id: r.id, version: ok.version, state: res.state } };
  }
  return { error: 'Masa şu an meşgul, tekrar deneyin.' };
}
