import { normalizeIban, validIban } from './util';

// Satılan kart türleri: panelde hangi alanın sorulacağı, girdinin nasıl doğrulanacağı
// ve kart okutulunca nereye gidileceği burada tanımlı.
export const TYPES = {
  iban: {
    label: 'IBAN kartı',
    value: { label: 'IBAN', placeholder: 'TR00 0000 0000 0000 0000 0000 00', max: 42 },
  },
  google: {
    label: 'Google yorum kartı',
    value: {
      label: 'Google yorum linki',
      placeholder: 'https://g.page/r/…/review',
      max: 300,
      hint: "Google İşletme Profili'nizde \"Yorum isteyin\" bölümündeki linki yapıştırın.",
    },
  },
  instagram: {
    label: 'Instagram kartı',
    value: { label: 'Instagram kullanıcı adı veya linki', placeholder: '@isletmeniz', max: 120 },
  },
};

export const isType = (t) => Object.hasOwn(TYPES, t);

const GOOGLE_HOSTS = ['g.page', 'google.com', 'google.com.tr', 'goo.gl', 'share.google'];
const hostOk = (host, list) => list.some((h) => host === h || host.endsWith(`.${h}`));

// Girdiyi doğrular: { value, extra } ya da { error } döner. Boş girdi alanı temizler.
export function parseInput(type, rawValue) {
  const raw = String(rawValue ?? '').trim();
  if (!raw) return { value: null, extra: null };

  if (type === 'iban') {
    const iban = normalizeIban(raw);
    return validIban(iban) ? { value: iban, extra: null } : { error: 'Geçersiz IBAN, lütfen kontrol edin.' };
  }

  if (type === 'google') {
    let u;
    try { u = new URL(raw); } catch { return { error: 'Geçerli bir link girin (https://… ile başlamalı).' }; }
    if (u.protocol !== 'https:' || !hostOk(u.hostname, GOOGLE_HOSTS)) {
      return { error: 'Bu bir Google linki gibi görünmüyor. Google İşletme Profili\'ndeki yorum linkini yapıştırın.' };
    }
    return { value: u.toString(), extra: null };
  }

  if (type === 'instagram') {
    let s = raw;
    const m = s.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
    if (m) s = m[1];
    s = s.replace(/^@/, '').replace(/\/+$/, '');
    if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) return { error: 'Geçerli bir Instagram kullanıcı adı girin.' };
    return { value: s, extra: null };
  }

  return { error: 'Bilinmeyen kart türü.' };
}

// Kart okutulunca gidilecek adres (IBAN kartında yok, sayfa gösterilir).
// Kayıtlı değer her seferinde yeniden doğrulanır.
export function targetUrl(type, value) {
  if (!value) return null;
  if (type === 'google') return parseInput('google', value).value ?? null;
  if (type === 'instagram') return `https://www.instagram.com/${encodeURIComponent(value)}/`;
  return null;
}
