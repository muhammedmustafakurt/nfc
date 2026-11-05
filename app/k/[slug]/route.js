import { NextResponse } from 'next/server';
import { get } from '@/lib/db';
import { targetUrl } from '@/lib/types';
import { chromeResponse } from '@/lib/chrome';

export const dynamic = 'force-dynamic';

// NFC kartın hedef adresini Chrome'da açtıran ara sayfa (kart okutma sayısı /[slug] sayfasında artar).
export async function GET(req, { params }) {
  const { slug } = await params;
  const biz = await get('SELECT type, value FROM businesses WHERE slug = ?', slug);
  const url = biz && biz.type !== 'iban' && targetUrl(biz.type, biz.value);
  if (!url) return NextResponse.redirect(new URL(`/${encodeURIComponent(slug)}`, req.url), 307);
  return chromeResponse(url);
}
