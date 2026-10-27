import Form from '@/components/Form';
import Mark from '@/components/Mark';
import { createCafe, deleteCafe, adminLogout } from '@/lib/actions';
import { getAdmin } from '@/lib/auth';
import { all } from '@/lib/db';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Kafeler · NFC Kart' };
export const dynamic = 'force-dynamic';

// Masa oyunu hizmeti verilen kafeler. NFC kart müşterilerinden (/admin) ayrı yönetilir.
export default async function CafesPage() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin');

  const cafes = await all('SELECT id, slug, name FROM cafes ORDER BY id DESC');
  const rooms = await all('SELECT biz_id, COUNT(*) AS n FROM game_rooms GROUP BY biz_id');
  const roomCount = new Map(rooms.map((r) => [r.biz_id, Number(r.n)]));

  return (
    <main className="shell wide">
      <header>
        <Mark />
        <div className="who-bar">
          <a className="btn sm" href="/admin">Kartlar</a>
          <span className="muted">{admin.username}</span>
          <form action={adminLogout}><button className="btn sm">Çıkış yap</button></form>
        </div>
      </header>
      <h1>Kafeler</h1>
      <p className="lead">Masa oyunları için kafe ekleyin. Her kafenin masaları <code>/kafe-adresi/masa-1/oyunlar</code> gibi adreslere açılır; karekodları buradan basabilirsiniz.</p>

      <section className="panel-box">
        <h2>Yeni kafe</h2>
        <Form action={createCafe} submit="Kafe ekle">
          <div className="row">
            <label>Kafe adı <input name="name" required maxLength={80} placeholder="Vosvos Cafe" /></label>
            <label>Adres (boşsa addan üretilir) <input name="slug" maxLength={50} placeholder="vosvoscafe" /></label>
          </div>
        </Form>
      </section>

      <section className="panel-box">
        <h2>Kayıtlı kafeler ({cafes.length})</h2>
        {cafes.length === 0 ? <p className="lead" style={{ margin: 0 }}>Henüz kafe eklenmedi.</p> : (
          <div className="tablewrap">
            <table className="cards-table">
              <thead><tr><th>Kafe</th><th>Adres</th><th>Açılan masa</th><th></th></tr></thead>
              <tbody>
                {cafes.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Kafe"><strong>{c.name}</strong></td>
                    <td data-label="Adres"><a href={`/${c.slug}/masa-1/oyunlar`} target="_blank">/{c.slug}/masa-1/oyunlar</a></td>
                    <td data-label="Açılan masa">{roomCount.get(c.id) || 0}</td>
                    <td className="actions">
                      <a className="btn sm primary" href={`/admin/qr/${c.slug}`} target="_blank">Masa karekodları</a>{' '}
                      <form action={deleteCafe}><input type="hidden" name="id" value={c.id} /><button className="btn sm danger">Sil</button></form>
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
