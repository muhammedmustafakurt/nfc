import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';
import { CODE_RE } from '@/lib/shortener';
import { notChrome, chromeResponse } from '@/lib/chrome';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { code } = await params;
  const row = CODE_RE.test(code) ? await get('SELECT url FROM short_links WHERE code = ?', code) : null;
  if (!row) return NextResponse.redirect(new URL('/kisalt', req.url), 307);
  await run('UPDATE short_links SET clicks = clicks + 1 WHERE code = ?', code);

  const ua = req.headers.get('user-agent') || '';
  if (notChrome(ua)) return chromeResponse(row.url);
  return new NextResponse(null, { status: 307, headers: { Location: row.url, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
