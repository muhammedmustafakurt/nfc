import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { get } from './db';

// Oturum imzası için gizli anahtar. SESSION_SECRET yoksa DATABASE_URL'den türetilir,
// böylece sunucusuz ortamda tüm örnekler aynı anahtarı kullanır.
function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  // Geliştirmede (canlı değilken) bağlantı adresi yoksa sabit bir yedek kullanılır.
  const base = process.env.DATABASE_URL || (process.env.NODE_ENV !== 'production' ? 'gelistirme-anahtari' : null);
  if (!base) throw new Error('SESSION_SECRET veya DATABASE_URL ayarlanmalı.');
  return crypto.createHash('sha256').update(`nfckart-session:${base}`).digest('hex');
}

const sig = (v) => crypto.createHmac('sha256', secret()).update(v).digest('base64url');

function sign(payload, maxAgeSec) {
  const v = `${payload}.${Date.now() + maxAgeSec * 1000}`;
  return `${v}.${sig(v)}`;
}

function verify(token) {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  const v = token.slice(0, i);
  const a = Buffer.from(token.slice(i + 1));
  const b = Buffer.from(sig(v));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const j = v.lastIndexOf('.');
  if (Number(v.slice(j + 1)) < Date.now()) return null;
  return v.slice(0, j);
}

const COOKIE = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' };
const MONTH = 60 * 60 * 24 * 30;

export async function setSession(kind, value) {
  (await cookies()).set(kind, sign(value, MONTH), { ...COOKIE, maxAge: MONTH });
}
export async function clearSession(kind) {
  (await cookies()).delete(kind);
}
export async function getSession(kind) {
  return verify((await cookies()).get(kind)?.value);
}

export function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') };
}
export function checkPassword(pw, salt, hash) {
  const a = Buffer.from(crypto.scryptSync(String(pw), salt, 32).toString('hex'));
  const b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function safeEqual(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

// Basit bellek içi hız sınırı: 15 dk içinde 8 hatalı deneme (IP başına)
const fails = (globalThis.__nfcFails ??= new Map());
export async function tooMany(scope) {
  const h = await headers();
  const key = `${scope}:${(h.get('x-forwarded-for') || 'local').split(',')[0].trim()}`;
  const now = Date.now();
  const rec = (fails.get(key) || []).filter((t) => now - t < 15 * 60 * 1000);
  fails.set(key, rec);
  return { blocked: rec.length >= 8, fail: () => fails.set(key, [...rec, now]) };
}

// Oturumdaki işletme; silinmişse oturum geçersiz sayılır (yönlendirme döngüsünü önler).
export async function currentBusinessId() {
  const id = await getSession('biz');
  if (!id) return null;
  return (await get('SELECT 1 FROM businesses WHERE id = ?', Number(id))) ? id : null;
}

// Admin giriş bilgileri. Geliştirmede varsayılan admin / admin123; canlıda ADMIN_PASSWORD zorunlu.
export function adminCreds() {
  const pass = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'admin123');
  return { user: process.env.ADMIN_USER || 'admin', pass };
}
