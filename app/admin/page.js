import Form from '@/components/Form';
import CopyButton from '@/components/CopyButton';
import Mark from '@/components/Mark';
import { adminLogin, adminLogout, createBusiness, deleteBusiness, resetBusiness } from '@/lib/actions';
import { getSession } from '@/lib/auth';
import { all } from '@/lib/db';
import { TYPES } from '@/lib/types';

export const metadata = { title: 'Yönetim · NFC Kart' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if ((await getSession('admin')) !== 'admin') {
    return (
      <main className="shell">
        <header><Mark /></header>
        <h1>Yönetim girişi</h1>
        <Form action={adminLogin} submit="Giriş yap">
          <label>Kullanıcı adı <input name="username" autoComplete="username" autoCapitalize="none" required /></label>
          <label>Şifre <input name="password" type="password" autoComplete="current-password" required /></label>
        </Form>
      </main>
    );
  }

  const list = await all('SELECT id, slug, name, type, value, taps, ref_code, email FROM businesses ORDER BY id DESC');
  return (
    <main className="shell wide">
      <header>
        <Mark />
        <form action={adminLogout}><button className="btn sm">Çıkış yap</button></form>
      </header>
      <h1>Kartlar</h1>
      <p className="lead">Satılan her kart için bir kayıt açın, çıkan referans kodunu müşteriye verin. Adres, karta yazacağınız linktir.</p>

      <section className="panel-box">
        <h2>Yeni kart</h2>
        <Form action={createBusiness} submit="Kart ekle">
          <div className="row">
            <label>İşletme adı <input name="name" required maxLength={80} placeholder="Resul Giyim" /></label>
            <label>Adres (boşsa addan üretilir) <input name="slug" maxLength={50} placeholder="resul-giyim" /></label>
            <label>Kart türü
              <select name="type" defaultValue="iban">
                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
          </div>
        </Form>
      </section>

      <section className="panel-box">
        <h2>Kayıtlı kartlar ({list.length})</h2>
        {list.length === 0 ? <p className="lead" style={{ margin: 0 }}>Henüz kart eklenmedi.</p> : (
          <div className="tablewrap">
            <table className="cards-table">
              <thead><tr><th>İşletme</th><th>Tür</th><th>Adres</th><th>Referans kodu</th><th>Hesap</th><th>Bilgi</th><th>Okutma</th><th></th></tr></thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id}>
                    <td data-label="İşletme"><strong>{b.name}</strong></td>
                    <td data-label="Tür">{TYPES[b.type]?.label}</td>
                    <td data-label="Adres"><a href={`/${b.slug}`} target="_blank">/{b.slug}</a></td>
                    <td data-label="Referans kodu">{b.email ? <span className="pill">kullanıldı</span> : <><code>{b.ref_code}</code> <CopyButton text={b.ref_code} label="Kopyala" /></>}</td>
                    <td data-label="Hesap">{b.email || <span className="pill">kayıt bekliyor</span>}</td>
                    <td data-label="Bilgi">{b.value ? <span className="pill on">eklendi</span> : <span className="pill">yok</span>}</td>
                    <td data-label="Okutma">{b.taps}</td>
                    <td className="actions">
                      {b.email && <form action={resetBusiness}><input type="hidden" name="id" value={b.id} /><button className="btn sm" title="Yeni referans kodu verir ve hesabı sıfırlar">Sıfırla</button></form>}{' '}
                      <form action={deleteBusiness}><input type="hidden" name="id" value={b.id} /><button className="btn sm danger">Sil</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
