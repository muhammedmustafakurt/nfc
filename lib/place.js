// Google Maps linkinden Place ID çıkarır; API anahtarı gerekmez.
// Place ID (ChIJ…), haritadaki "0xAAAA:0xBBBB" kimliğinin protobuf + base64 hâlidir.

const le = (hex) => {
  let n = BigInt(`0x${hex}`);
  const out = [];
  for (let i = 0; i < 8; i++) { out.push(Number(n & 0xffn)); n >>= 8n; }
  return out;
};

export function fidToPlaceId(a, b) {
  if (a.length > 16 || b.length > 16) return null;
  const bytes = [0x0a, 0x12, 0x09, ...le(a), 0x11, ...le(b)];
  return Buffer.from(bytes).toString('base64url');
}

export const PLACE_ID_RE = /^ChIJ[A-Za-z0-9_-]{23}$/;
export const reviewLink = (id) => `https://search.google.com/local/writereview?placeid=${id}`;

const HOSTS = ['google.com', 'google.com.tr', 'maps.app.goo.gl', 'goo.gl', 'g.co', 'share.google'];
const hostOk = (h) => HOSTS.some((x) => h === x || h.endsWith(`.${x}`));

const FID_RE = /0x([0-9a-f]{1,16}):0x([0-9a-f]{1,16})/i;

function nameFrom(u) {
  const m = u.pathname.match(/\/maps\/place\/([^/]+)/);
  if (!m) return '';
  try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch { return m[1]; }
}

// Tek satırı çözer: { input, name, id, link } ya da { input, error }.
export async function resolveOne(input) {
  input = input.trim();
  if (PLACE_ID_RE.test(input)) return { input, name: '', id: input, link: reviewLink(input) };

  let url;
  try { url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`); } catch { return { input, error: 'Link okunamadı.' }; }

  try {
    for (let hop = 0; hop < 6; hop++) {
      if (url.protocol !== 'https:' || !hostOk(url.hostname) && url.hostname !== 'consent.google.com') return { input, error: 'Bu bir Google Haritalar linki değil.' };
      const m = decodeURIComponent(url.href).match(FID_RE) || (url.searchParams.get('ftid') || '').match(FID_RE);
      if (m) {
        const id = fidToPlaceId(m[1], m[2]);
        if (id) return { input, name: nameFrom(url), id, link: reviewLink(id) };
      }
      const res = await fetch(url, {
        redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'Accept-Language': 'tr-TR,tr;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' },
      });
      const loc = res.headers.get('location');
      if (loc) {
        let next = new URL(loc, url);
        if (next.hostname === 'consent.google.com' && next.searchParams.get('continue')) next = new URL(next.searchParams.get('continue'));
        url = next;
        continue;
      }
      // Yönlendirme yoksa sayfanın içinde ara.
      const html = await res.text();
      const h = html.match(FID_RE);
      if (h) {
        const id = fidToPlaceId(h[1], h[2]);
        if (id) return { input, name: nameFrom(url), id, link: reviewLink(id) };
      }
      break;
    }
  } catch {
    return { input, error: 'Link açılamadı.' };
  }
  return { input, error: 'Place ID bulunamadı. Haritalar\'daki işletme sayfasının "Paylaş" linkini kullanın.' };
}
