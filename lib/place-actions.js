'use server';
import { resolveOne } from './place';
import { shorten } from './shortener-actions';

// Satır satır Google Haritalar linki alır; her biri için Place ID ve yorum linki döner (sıra korunur).
export async function findPlaces(fd) {
  const lines = String(fd.get('links') ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { error: 'En az bir Google Haritalar linki yapıştırın.' };
  if (lines.length > 300) return { error: 'Bir seferde en fazla 300 satır.' };
  const out = [];
  for (let i = 0; i < lines.length; i += 10) {
    out.push(...await Promise.all(lines.slice(i, i + 10).map(resolveOne)));
  }
  // Chrome yönlendirmesi kısa linkte (/l/<kod>) olduğu için her yorum linki otomatik kısaltılır.
  for (const r of out) {
    if (!r.link) continue;
    const fd2 = new FormData(); fd2.set('url', r.link);
    const s = await shorten(fd2);
    if (s.short) r.short = s.short;
  }
  return { rows: out };
}
