import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';
import { CODE_RE } from '@/lib/shortener';

export const dynamic = 'force-dynamic';

// Uygulama içi tarayıcılar (Instagram, Facebook, WhatsApp, TikTok, Android WebView...).
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|musical_ly|BytedanceWebview|Twitter|LinkedInApp|Pinterest|Line\/|WhatsApp|; wv\)/i;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Chrome'u doğrudan açan adresler: Android intent, iOS Chrome şeması.
function chromeLinks(dest) {
  const u = new URL(dest);
  const rest = `${u.host}${u.pathname}${u.search}${u.hash}`;
  return {
    android: `intent://${rest}#Intent;scheme=${u.protocol.slice(0, -1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(dest)};end`,
    ios: `${u.protocol === 'https:' ? 'googlechromes' : 'googlechrome'}://${rest}`,
  };
}

function page(dest) {
  const { android, ios } = chromeLinks(dest);
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Chrome'da aç</title>
<style>body{font:16px system-ui,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f5fb;color:#14172b}main{max-width:380px;padding:28px 20px;text-align:center}h1{font-size:1.5rem;margin:0 0 10px}p{color:#5b6078;margin:0 0 22px}a.b{display:block;padding:15px;border-radius:14px;background:#2438e8;color:#fff;font-weight:800;text-decoration:none;margin-bottom:12px}a.s{color:#5b6078;font-size:.92rem}</style></head>
<body><main><h1>Chrome'da açın</h1><p>Bu uygulamanın içindeki tarayıcı yerine Chrome'da açmak daha sorunsuz çalışır.</p>
<a class="b" id="chrome" href="${esc(android)}">Chrome'da aç</a><a class="s" href="${esc(dest)}">Bu tarayıcıda devam et</a></main>
<script>(function(){var a=document.getElementById('chrome'),ios=/iPhone|iPad|iPod/i.test(navigator.userAgent);if(ios)a.href=${JSON.stringify(ios).replace(/</g, '\u003c')};else if(!/Android/i.test(navigator.userAgent))a.href=${JSON.stringify(dest).replace(/</g, '\u003c')};
if(/Android/i.test(navigator.userAgent))setTimeout(function(){location.href=a.href},200);})();</script></body></html>`;
}

export async function GET(req, { params }) {
  const { code } = await params;
  const row = CODE_RE.test(code) ? await get('SELECT url FROM short_links WHERE code = ?', code) : null;
  if (!row) return NextResponse.redirect(new URL('/kisalt', req.url), 307);
  await run('UPDATE short_links SET clicks = clicks + 1 WHERE code = ?', code);

  const ua = req.headers.get('user-agent') || '';
  if (IN_APP.test(ua)) {
    return new NextResponse(page(row.url), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  }
  return new NextResponse(null, { status: 307, headers: { Location: row.url, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
