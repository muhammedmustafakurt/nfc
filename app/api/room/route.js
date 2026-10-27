import { NextResponse } from 'next/server';
import { findCafe, readRoom, mutate, view, ROOM_GAMES, MASA_RE, PID_RE } from '@/lib/rooms';

export const dynamic = 'force-dynamic';

const json = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const ACTIONS = new Set(['join', 'leave', 'start', 'roll', 'buy', 'skip', 'move', 'accuse', 'vote', 'guess', 'timeout', 'clue', 'pick', 'endturn', 'reset']);

async function resolve({ cafe, masa, game, pid }) {
  if (!/^[a-z0-9-]{1,50}$/.test(String(cafe)) || !MASA_RE.test(String(masa)) || !ROOM_GAMES.has(game) || !PID_RE.test(String(pid))) {
    return { err: json({ error: 'Geçersiz istek.' }, 400) };
  }
  const biz = await findCafe(cafe);
  if (!biz) return { err: json({ error: 'Kafe bulunamadı.' }, 404) };
  return { biz };
}

// Sürüm değişmediyse yalnızca { unchanged } döner (sık yoklama ucuz kalsın diye).
export async function GET(req) {
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const { biz, err } = await resolve(q);
  if (err) return err;
  const room = await readRoom(biz.id, q.masa, q.game);
  if (String(room.version) === q.v) return json({ unchanged: true, version: room.version });
  return json(view(room, q.pid, q.game));
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek.' }, 400); }
  const { biz, err } = await resolve(body);
  if (err) return err;
  const a = body.action;
  if (!a || !ACTIONS.has(a.type)) return json({ error: 'Bilinmeyen işlem.' }, 400);
  const res = await mutate(biz.id, body.masa, body.game, body.pid, { type: a.type, name: a.name, from: a.from, to: a.to, target: a.target, yes: a.yes, loc: a.loc, word: a.word, num: a.num, card: a.card });
  return json({ ...view(res.room, body.pid, body.game), ...(res.error && { error: res.error }) }, res.error ? 409 : 200);
}
