import Link from 'next/link';
import { redirect } from 'next/navigation';
import Form from '@/components/Form';
import Mark from '@/components/Mark';
import { saveProfile, logout } from '@/lib/actions';
import { getSession } from '@/lib/auth';
import { get } from '@/lib/db';
import { TYPES } from '@/lib/types';
import { prettyIban } from '@/lib/util';

export const metadata = { title: 'Panel · NFC Kart' };
export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  const id = await getSession('biz');
  const biz = id && await get('SELECT slug, name, type, value, taps, email FROM businesses WHERE id = ?', Number(id));
  if (!biz) redirect('/giris');

  const t = TYPES[biz.type] ?? TYPES.iban;
  const shown = biz.type === 'iban' ? prettyIban(biz.value) : biz.type === 'instagram' && biz.value ? `@${biz.value}` : biz.value;

  return (
    <main className="shell">
      <header>
        <Mark />
        <form action={logout}><button className="btn sm">Çıkış yap</button></form>
      </header>
      <h1>{t.label}</h1>
      <p className="lead">Burada yaptığınız değişiklik, kartı okutan herkese hemen yansır. Kartı yeniden yazdırmanız gerekmez.</p>
      <div className="meta">
        <Link className="site-link" href={`/${biz.slug}`}>Kartınızı deneyin: /{biz.slug}</Link>
        <p className="taps"><strong>{biz.taps}</strong> kez okutuldu</p>
      </div>
      <Form action={saveProfile} submit="Kaydet">
        <label>İşletme adı <input name="name" required maxLength={80} defaultValue={biz.name} /></label>
        <label>
          {t.value.label}
          <input name="value" maxLength={t.value.max} defaultValue={shown ?? ''} placeholder={t.value.placeholder} />
          {t.value.hint && <span className="hint">{t.value.hint}</span>}
        </label>
      </Form>
      <p className="alt">Giriş yapılan hesap: {biz.email}</p>
    </main>
  );
}
