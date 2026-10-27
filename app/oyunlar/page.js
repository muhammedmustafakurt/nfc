import { cookies } from 'next/headers';
import Link from 'next/link';
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
      <h1>Masa oyunları</h1>
      <p className="lead">Telefonda hemen oynayın. Henüz hazır olmayan oyunlarda &quot;Oynamak istiyorum&quot; diyerek bize hangisini yapmamız gerektiğini söyleyin.</p>
      <ul className="game-list">
        {GAMES.map((g) => {
          const done = voted.includes(g.id);
          return (
            <li key={g.id}>
              <div>
                <strong>{g.name}</strong>
                <span className="muted">{g.players} kişi · {g.minutes} dk · {g.note}</span>
              </div>
              {g.play ? (
                <Link className="btn sm primary" href={`/oyunlar/${g.id}`}>Oyna</Link>
              ) : (
                <form action={voteGame}>
                  <input type="hidden" name="game" value={g.id} />
                  <button className="btn sm" disabled={done}>{done ? 'İlginiz kaydedildi' : 'Oynamak istiyorum'}</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
