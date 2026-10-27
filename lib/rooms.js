// Kafe masası odaları: bir (kafe, masa, oyun) için tek oda. Oyun kuralları ve zarlar sunucuda işlenir;
// telefonlar yalnızca kendi sırasında hamle isteyebilir. Durum veritabanında tutulur (sunucusuz ortamda
// bellek paylaşılmadığı için), istemciler kısa aralıkla sürüm numarasını sorar.
import { get, run } from './db';
import * as E from './emlak';
import * as C from './chess';
import * as S from './spyfall';
import * as A from './ajanlar';
import * as V from './vampir';
import * as T from './tabu';
import * as K from './kimim';
import * as P from './cizim';
import * as B from './bil';

// Oyun başına koltuk sayısı; satrançta 1. koltuk Beyaz, 2. koltuk Siyah.
const CONFIG = { monopoly: { max: 4, min: 2 }, satranc: { max: 2, min: 2 }, spyfall: { max: 8, min: 3 }, ajanlar: { max: 8, min: 4 }, vampir: { max: 10, min: 5 }, tabu: { max: 10, min: 4 }, kimim: { max: 10, min: 3 }, cizim: { max: 10, min: 3 }, bil: { max: 10, min: 2 } };
export const ROOM_GAMES = new Set(Object.keys(CONFIG));
export const MASA_RE = /^masa-\d{1,3}$/;
export const PID_RE = /^[a-zA-Z0-9]{16,64}$/;
const STALE_MS = 6 * 60 * 60 * 1000; // 6 saat işlem görmeyen oda sıfırlanır

const fresh = () => ({ phase: 'lobby', seats: [], game: null });
const clean = (n) => String(n ?? '').replace(/[<>]/g, '').trim().slice(0, 16);
const die = () => 1 + Math.floor(Math.random() * 6);
const sq = (p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 0 && n < 8);

export const findCafe = (slug) => get('SELECT id, name FROM cafes WHERE slug = ?', slug);

// biz_id sütunu kafe numarasını (cafes.id) tutar.
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
export function view(room, pid, game) {
  const s = room.state;
  const me = s.seats.findIndex((x) => x.pid === pid);
  return {
    version: room.version,
    phase: s.phase,
    seats: s.seats.map((x) => ({ name: x.name, left: !!x.left })),
    me,
    // Casus oyununda mekân ve casus sunucuda kalır; her oyuncuya yalnızca kendi kartı gider.
    game: game === 'spyfall' ? S.viewFor(s.game, me) : game === 'ajanlar' ? A.viewFor(s.game, me) : game === 'vampir' ? V.viewFor(s.game, me) : game === 'tabu' ? T.viewFor(s.game, me) : game === 'kimim' ? K.viewFor(s.game, me) : game === 'cizim' ? P.viewFor(s.game, me) : game === 'bil' ? B.viewFor(s.game, me) : s.game,
  };
}

function apply(s, pid, a, game) {
  const cfg = CONFIG[game];
  const idx = s.seats.findIndex((x) => x.pid === pid);
  const g = s.game;
  switch (a.type) {
    case 'join': {
      if (idx >= 0) {
        s.seats[idx].name = clean(a.name) || s.seats[idx].name;
        return { state: s };
      }
      if (s.phase !== 'lobby') return { error: 'Oyun başladı, bu oyuna sonradan katılınamaz. İzleyebilirsiniz.' };
      if (s.seats.length >= cfg.max) return { error: `Masa dolu (en fazla ${cfg.max} kişi).` };
      s.seats.push({ pid, name: clean(a.name) || `Oyuncu ${s.seats.length + 1}` });
      return { state: s };
    }
    case 'leave': {
      if (idx < 0) return { state: s };
      if (s.phase === 'lobby') { s.seats.splice(idx, 1); return { state: s }; }
      s.seats[idx].left = true;
      if (game === 'monopoly') s.game = E.forfeit(g, idx);
      else if (game === 'spyfall') s.game = S.onLeave(g, s.seats, idx);
      else if (game === 'ajanlar') s.game = A.onLeave(g, s.seats, idx);
      else if (game === 'vampir') s.game = V.onLeave(g, s.seats, idx);
      else if (game === 'tabu') s.game = T.onLeave(g, s.seats, idx);
      else if (game === 'kimim') s.game = K.onLeave(g, s.seats, idx);
      else if (game === 'cizim') s.game = P.onLeave(g, s.seats, idx);
      else if (game === 'bil') s.game = B.onLeave(g, s.seats, idx);
      else if (!g.over) {
        const other = s.seats[1 - idx];
        s.game = { ...g, over: `${other.name} kazandı (rakip masadan ayrıldı).`, draw: false };
      }
      return { state: s };
    }
    case 'start': {
      if (idx < 0 || s.phase !== 'lobby') return { error: 'Oyunu yalnızca masaya katılmış oyuncular başlatabilir.' };
      if (s.seats.length < cfg.min) return { error: `Başlamak için en az ${cfg.min} kişi gerekir.` };
      if (game === 'monopoly') {
        const ng = E.newGame(s.seats.length);
        ng.players.forEach((p, i) => { p.name = s.seats[i].name; });
        ng.msg = `${ng.players[0].name} zar atsın.`;
        s.game = ng;
      } else if (game === 'bil') {
        s.game = B.newGame(s.seats.length);
      } else if (game === 'cizim') {
        s.game = P.newGame(s.seats);
      } else if (game === 'kimim') {
        s.game = K.newGame(s.seats.length);
        s.game.note = `${s.seats[s.game.turn].name} ilk soruyu soruyor.`;
      } else if (game === 'tabu') {
        s.game = T.newGame(s.seats.length, s.seats);
      } else if (game === 'vampir') {
        s.game = V.newGame(s.seats.length);
      } else if (game === 'ajanlar') {
        s.game = A.newGame(s.seats.length);
      } else if (game === 'spyfall') {
        s.game = S.newGame(s.seats.length);
        s.game.note = `${s.seats[s.game.first].name} ilk soruyu soruyor.`;
      } else {
        s.game = C.newGame();
      }
      s.phase = 'play';
      return { state: s };
    }
    case 'roll':
    case 'buy':
    case 'skip': {
      if (game !== 'monopoly') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0) return { error: 'Oyunda değilsiniz.' };
      if (g.turn !== idx) return { error: 'Sıra sizde değil.' };
      const need = a.type === 'roll' ? 'roll' : 'buy';
      if (g.phase !== need) return { error: 'Şu an bu hamle yapılamaz.' };
      s.game = a.type === 'roll'
        ? E.roll(g, die(), die(), Math.floor(Math.random() * 4))
        : a.type === 'buy' ? E.buy(g) : E.skipBuy(g);
      return { state: s };
    }
    case 'move': {
      if (game !== 'satranc') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || idx > 1) return { error: 'Oyunda değilsiniz.' };
      if (g.turn !== (idx === 0 ? 'w' : 'b')) return { error: 'Sıra sizde değil.' };
      if (!sq(a.from) || !sq(a.to)) return { error: 'Geçersiz hamle.' };
      const r = C.play(g, a.from[0], a.from[1], a.to[0], a.to[1], { w: s.seats[0].name, b: s.seats[1].name });
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'begin':
    case 'right':
    case 'pass':
    case 'taboo': {
      if (game !== 'tabu') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = a.type === 'begin' ? T.begin(g, s.seats, idx) : T.act(g, s.seats, idx, a.type);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'bpick':
    case 'btimeout': {
      if (game !== 'bil') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = a.type === 'bpick' ? B.pick(g, s.seats, idx, a.choice) : B.timeout(g, s.seats);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'ddraw':
    case 'dset':
    case 'dguess':
    case 'dswap':
    case 'dtimeout': {
      if (game !== 'cizim') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = a.type === 'ddraw' ? P.draw(g, idx, a.strokes)
        : a.type === 'dset' ? P.keep(g, idx, a.keep)
        : a.type === 'dguess' ? P.guess(g, s.seats, idx, a.text)
        : a.type === 'dswap' ? P.swap(g, idx)
        : P.timeout(g, s.seats);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'kok':
    case 'kno':
    case 'kskip':
    case 'ktimeout': {
      if (game !== 'kimim') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      s.game = a.type === 'ktimeout' ? K.timeout(g, s.seats) : K.act(g, s.seats, idx, a.type);
      if (s.game.error) return { error: s.game.error };
      return { state: s };
    }
    case 'kill':
    case 'protect':
    case 'inspect': {
      if (game !== 'vampir') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = V.nightAction(g, s.seats, idx, a.type, a.target);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'accuse':
    case 'vote':
    case 'guess':
    case 'timeout': {
      if (game === 'tabu' && a.type === 'timeout') {
        if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
        const r = T.timeout(g, s.seats);
        if (r.error) return { error: r.error };
        s.game = r;
        return { state: s };
      }
      if (game === 'vampir' && a.type === 'vote') {
        if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
        const r = V.castVote(g, s.seats, idx, a.target);
        if (r.error) return { error: r.error };
        s.game = r;
        return { state: s };
      }
      if (game !== 'spyfall') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = a.type === 'accuse' ? S.accuse(g, s.seats, idx, a.target)
        : a.type === 'vote' ? S.castVote(g, s.seats, idx, a.yes === true)
        : a.type === 'guess' ? S.guess(g, s.seats, idx, a.loc)
        : S.timeout(g);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'clue':
    case 'pick':
    case 'endturn': {
      if (game !== 'ajanlar') return { error: 'Bilinmeyen işlem.' };
      if (s.phase !== 'play' || idx < 0 || s.seats[idx].left) return { error: 'Oyunda değilsiniz.' };
      const r = a.type === 'clue' ? A.giveClue(g, s.seats, idx, a.word, a.num)
        : a.type === 'pick' ? A.pick(g, s.seats, idx, a.card)
        : A.endTurn(g, s.seats, idx);
      if (r.error) return { error: r.error };
      s.game = r;
      return { state: s };
    }
    case 'reset': {
      const over = game === 'monopoly' ? g?.phase === 'over'
        : game === 'spyfall' ? !!g?.over || Date.now() >= g.endsAt
        : !!g?.over;
      if (s.phase !== 'play' || !over) return { error: 'Oyun henüz bitmedi.' };
      // Masada kalan oyuncu yeniden oynamak için koltuğunu korur. İzleyici ya da ayrılmış biri sıfırlarsa, kimsenin
      // beklemediği (sayfayı kapatmış) oyuncular masada takılı kalmasın diye koltuklar boşaltılır.
      const here = idx >= 0 && !s.seats[idx].left;
      s.seats = here ? s.seats.filter((x) => !x.left) : [];
      // Satrançta rövanşta renkler değişir.
      if (game === 'satranc' && s.seats.length === 2) s.seats.reverse();
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
    const res = apply(structuredClone(r.state), pid, action, game);
    if (res.error) return { error: res.error, room: r };
    const ok = await get(
      'UPDATE game_rooms SET state = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ? RETURNING version',
      JSON.stringify(res.state), Date.now(), r.id, r.version,
    );
    if (ok) return { room: { id: r.id, version: ok.version, state: res.state } };
  }
  return { error: 'Masa şu an meşgul, tekrar deneyin.' };
}
