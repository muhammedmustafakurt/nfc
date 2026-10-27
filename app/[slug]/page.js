import { notFound, redirect } from 'next/navigation';
import { get, run } from '@/lib/db';
import { prettyIban } from '@/lib/util';
import { targetUrl } from '@/lib/types';
import { orderLink } from '@/lib/site';
import CopyButton from '@/components/CopyButton';
import Mark from '@/components/Mark';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const biz = await get('SELECT name FROM businesses WHERE slug = ?', slug);
  return { title: biz ? biz.name : 'NFC Kart' };
}

export default async function BusinessPage({ params }) {
  const { slug } = await params;
  const biz = await get('SELECT id, name, type, value FROM businesses WHERE slug = ?', slug);
  if (!biz) notFound();

  if (biz.value) {
    await run('UPDATE businesses SET taps = taps + 1 WHERE id = ?', biz.id);
    // Google ve Instagram kartları kart okutulunca doğrudan ilgili uygulamayı açar.
    const url = biz.type !== 'iban' && targetUrl(biz.type, biz.value);
    if (url) redirect(url);
  }

  const groups = biz.type === 'iban' && biz.value ? prettyIban(biz.value).split(' ') : [];
  const contact = orderLink('Merhaba, NFC Kart hakkında bilgi almak istiyorum.');

  return (
    <div className="stage">
      <div className="stage-in">
        <Mark />
        <div className="who">
          {groups.length > 0 && <p className="cap">Ad Soyad</p>}
          <div className="field name">
            <h1 className={biz.name.length > 22 ? 'long' : undefined}>{biz.name}</h1>
            {groups.length > 0 && <CopyButton variant="icon" text={biz.name} label="İsmi kopyala" />}
          </div>
          {groups.length > 0 ? (
            <>
              <p>Havale / EFT için IBAN</p>
              <div className="field iban">
                <ul className="iban-groups" aria-label={`IBAN: ${prettyIban(biz.value)}`}>
                  {groups.map((g, i) => (
                    <li key={i} style={{ '--i': i }} aria-hidden="true">{g}</li>
                  ))}
                </ul>
                <CopyButton variant="icon" text={biz.value} label="IBAN'ı kopyala" />
              </div>
            </>
          ) : (
            <p className="empty">Bu kart henüz ayarlanmadı.</p>
          )}
        </div>
        {contact && (
          <p className="stage-foot">
            Siz de NFC Kart isterseniz <a href={contact} target="_blank" rel="noopener noreferrer">iletişime geçin</a>
          </p>
        )}
      </div>
    </div>
  );
}
