import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';
import PrintButton from '@/components/PrintButton';
import { getAdmin } from '@/lib/auth';
import { get } from '@/lib/db';

export const metadata = { title: 'Masa karekodları · NFC Kart' };
export const dynamic = 'force-dynamic';

// Kafenin masaları için karekodlar: her kod /<kafe>/masa-N/oyunlar adresine açılır.
export default async function QrPage({ params, searchParams }) {
  if (!(await getAdmin())) redirect('/admin');
  const { slug } = await params;
  const biz = await get('SELECT name FROM businesses WHERE slug = ?', slug);
  if (!biz) notFound();
  const sp = await searchParams;
  const n = Math.min(Math.max(parseInt(sp.n, 10) || 10, 1), 60);

  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || (host?.startsWith('localhost') ? 'http' : 'https');
  const base = (process.env.SITE_URL || `${proto}://${host}`).replace(/\/+$/, '');

  const codes = await Promise.all(Array.from({ length: n }, async (_, i) => {
    const url = `${base}/${slug}/masa-${i + 1}/oyunlar`;
    return { no: i + 1, url, svg: await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }) };
  }));

  return (
    <main className="shell wide qr-page">
      <h1 className="no-print">{biz.name}: masa karekodları</h1>
      <form className="no-print qr-form" method="get">
        <label>Masa sayısı <input name="n" type="number" min="1" max="60" defaultValue={n} /></label>
        <button className="btn">Güncelle</button>
        <PrintButton />
      </form>
      <p className="muted no-print">Adresler <code>{base}</code> ile başlıyor. Yayındaki alan adıyla çıkması için Vercel ortam değişkenlerine <code>SITE_URL</code> ekleyin ya da bu sayfayı yayındaki adresten açın.</p>
      <div className="qr-grid">
        {codes.map((c) => (
          <figure key={c.no} className="qr-card">
            <figcaption>Masa {c.no}</figcaption>
            <div className="qr-svg" dangerouslySetInnerHTML={{ __html: c.svg }} />
            <small>Oyun oynamak için okutun</small>
          </figure>
        ))}
      </div>
    </main>
  );
}
