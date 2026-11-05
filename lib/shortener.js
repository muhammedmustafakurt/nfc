export const CODE_RE = /^[a-z0-9-]{3,32}$/;

// Girilen metni geçerli bir http(s) adresine çevirir; olmazsa null.
export function cleanUrl(input, ownHost) {
  let s = String(input || '').trim();
  if (!s || s.length > 2000 || /\s/.test(s)) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password || !u.hostname.includes('.')) return null;
  if (ownHost && u.host.toLowerCase() === ownHost.toLowerCase()) return null; // kendi sitemize yönlendirme döngüsü
  return u.href;
}

// IP başına saatte 20 kısaltma (bellek içi).
const hits = (globalThis.__nfcShort ??= new Map());
export function limited(ip, scope = 'short') {
  ip = `${scope}:${ip}`;
  const now = Date.now();
  const rec = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (rec.length >= 20) { hits.set(ip, rec); return true; }
  hits.set(ip, [...rec, now]);
  return false;
}

