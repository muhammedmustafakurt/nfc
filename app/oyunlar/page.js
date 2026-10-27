import { cookies } from 'next/headers';
import Mark from '@/components/Mark';
import { GAMES } from '@/lib/games';
import { voteGame } from '@/lib/game-actions';

export const metadata = { title: 'Masa oyunları · NFC Kart' };
export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const voted = ((await cookies()).get('gv')?.value || '').split(',');
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Hangi oyunu oynamak istersiniz?</h1>
      <p className="lead">Kafelere özel masa oyunu hizmeti için talebi ölçüyoruz. Oynamak istediğiniz oyunlara dokunun.</p>
      <ul className="game-list">
        {GAMES.map((g) => {
          const done = voted.includes(g.id);
          return (
            <li key={g.id}>
              <div>
                <strong>{g.name}</strong>
                <span className="muted">{g.players} kişi · {g.minutes} dk · {g.note}</span>
              </div>
              <form action={voteGame}>
                <input type="hidden" name="game" value={g.id} />
                <button className={`btn sm${done ? '' : ' primary'}`} disabled={done}>{done ? 'Oy verildi' : 'Oynamak istiyorum'}</button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
