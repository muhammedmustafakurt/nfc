'use server';
import crypto from 'node:crypto';
import { headers } from 'next/headers';
import { get, run } from './db';
import { cleanUrl, CODE_RE } from './shortener';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

// Dönen { url, short, code }: her sonuç, girilen uzun adresle birlikte döner; böylece liste karışmaz.
export async function shorten(fd) {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || (host?.startsWith('localhost') ? 'http' : 'https');

  const url = cleanUrl(fd.get('url'), host);
  if (!url) return { error: 'Geçerli bir web adresi girin (ör. https://ornek.com/sayfa).' };
  const alias = String(fd.get('alias') ?? '').trim().toLowerCase();
  if (alias && !CODE_RE.test(alias)) return { error: 'Özel ad 3-32 karakter olmalı: harf, rakam veya tire.' };

  let code;
  if (alias) {
    const ex = await get('SELECT url FROM short_links WHERE code = ?', alias);
    if (ex && ex.url !== url) return { error: 'Bu özel ad kullanılıyor, başka bir ad deneyin.' };
    if (!ex) await run('INSERT INTO short_links (code, url, created_at) VALUES (?, ?, ?)', alias, url, Date.now());
    code = alias;
  } else {
    code = (await get('SELECT code FROM short_links WHERE url = ? AND code ~ ?', url, '^[a-z2-9]{6}$'))?.code;
    while (!code) {
      const c = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % 32]).join('');
      if (await get('SELECT 1 FROM short_links WHERE code = ?', c)) continue;
      await run('INSERT INTO short_links (code, url, created_at) VALUES (?, ?, ?)', c, url, Date.now());
      code = c;
    }
  }
  return { url, code, short: `${proto}://${host}/l/${code}` };
}
