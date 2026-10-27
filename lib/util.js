const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

export function slugify(s) {
  return String(s || '')
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => TR[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export const RESERVED_SLUGS = new Set(['admin', 'giris', 'kayit', 'panel', 'api', 'cikis']);

export function normalizeIban(s) {
  return String(s || '').replace(/\s+/g, '').toUpperCase();
}

// ISO 13616 mod-97; TR için 26 hane
export function validIban(iban) {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  if (iban.startsWith('TR') && iban.length !== 26) return false;
  const moved = iban.slice(4) + iban.slice(0, 4);
  let rem = 0;
  for (const ch of moved) {
    const v = ch >= 'A' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem === 1;
}

export const prettyIban = (i) => (i || '').replace(/(.{4})/g, '$1 ').trim();
