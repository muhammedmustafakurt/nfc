import Form from '@/components/Form';
import ResetBusiness from '@/components/ResetBusiness';
import Mark from '@/components/Mark';
import {
  adminLogin, adminLogout, createBusiness, deleteBusiness, resetBusiness,
  createAdmin, deleteAdmin, resetAdminPassword, changeOwnPassword,
} from '@/lib/actions';
import { getAdmin } from '@/lib/auth';
import { all } from '@/lib/db';
import { TYPES } from '@/lib/types';

export const metadata = { title: 'Yönetim · NFC Kart' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) {
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

  const list = await all('SELECT id, slug, name, type, value, taps, email FROM businesses ORDER BY id DESC');
  const admins = admin.main ? await all('SELECT id, username FROM admins ORDER BY id') : [];
  return (
    <main className="shell wide">
      <header>
        <Mark />
        <div className="who-bar">
          <a className="btn sm" href="/admin/kafeler">Kafeler</a>
          <span className="muted">{admin.username}{admin.main ? ' (ana admin)' : ''}</span>
          <form action={adminLogout}><button className="btn sm">Çıkış yap</button></form>
        </div>
      </header>
      <h1>Kartlar</h1>
      <p className="lead">Satılan her kart için bir kayıt açın, çıkan referans kodunu müşteriye verin. Kod güvenlik için yalnızca üretildiği anda görünür; kaybolursa "Yeni kod ver" deyin. Adres, karta yazacağınız linktir.</p>

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
                    <td data-label="Referans kodu">{b.email ? <span className="pill">kullanıldı</span> : <span className="pill">kayıt bekliyor</span>}</td>
                    <td data-label="Hesap">{b.email || <span className="muted-dash">—</span>}</td>
                    <td data-label="Bilgi">{b.value ? <span className="pill on">eklendi</span> : <span className="pill">yok</span>}</td>
                    <td data-label="Okutma">{b.taps}</td>
                    <td className="actions">
                      <ResetBusiness
                        action={resetBusiness}
                        id={b.id}
                        label={b.email ? 'Hesabı sıfırla' : 'Yeni kod ver'}
                        title="Yeni referans kodu üretir; hesap varsa sıfırlar (ad ve bilgi korunur)"
                      />{' '}
                      <form action={deleteBusiness}><input type="hidden" name="id" value={b.id} /><button className="btn sm danger">Sil</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {admin.main ? (
        <section className="panel-box">
          <h2>Yöneticiler ({admins.length + 1})</h2>
          <p className="lead">Ana admin (<strong>{admin.username}</strong>) ortam değişkenlerinden gelir ve silinemez. Eklediğiniz yöneticiler kart oluşturup yönetebilir; yönetici ekleyip silemezler.</p>
          {admins.length > 0 && (
            <ul className="admin-list">
              {admins.map((a) => (
                <li key={a.id}>
                  <span>{a.username}</span>
                  <form action={deleteAdmin}><input type="hidden" name="id" value={a.id} /><button className="btn sm danger">Sil</button></form>
                </li>
              ))}
            </ul>
          )}
          <h3>Yeni yönetici</h3>
          <Form action={createAdmin} submit="Yönetici ekle">
            <div className="row">
              <label>Kullanıcı adı <input name="username" autoComplete="off" autoCapitalize="none" required minLength={3} maxLength={32} /></label>
              <label>Şifre (en az 8 karakter) <input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
            </div>
          </Form>
          {admins.length > 0 && (
            <>
              <h3>Şifre sıfırla</h3>
              <Form action={resetAdminPassword} submit="Şifreyi değiştir">
                <div className="row">
                  <label>Yönetici
                    <select name="id" defaultValue={admins[0].id}>
                      {admins.map((a) => <option key={a.id} value={a.id}>{a.username}</option>)}
                    </select>
                  </label>
                  <label>Yeni şifre <input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
                </div>
              </Form>
            </>
          )}
        </section>
      ) : (
        <section className="panel-box">
          <h2>Şifremi değiştir</h2>
          <Form action={changeOwnPassword} submit="Şifreyi değiştir">
            <div className="row">
              <label>Mevcut şifre <input name="current" type="password" autoComplete="current-password" required /></label>
              <label>Yeni şifre (en az 8 karakter) <input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
            </div>
          </Form>
        </section>
      )}
    </main>
  );
}
