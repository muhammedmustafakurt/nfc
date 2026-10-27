import Link from 'next/link';
import Mark from '@/components/Mark';
import { GAMES } from '@/lib/games';

export const metadata = { title: 'Masa oyunları · NFC Kart' };

export default function GamesPage() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Masa oyunları</h1>
      <p className="lead">Telefonda hemen oynayın.</p>
      <ul className="game-list">
        {GAMES.map((g) => (
          <li key={g.id}>
            <div>
              <strong>{g.name}</strong>
              <span className="muted">{g.players} kişi · {g.minutes} dk · {g.note}</span>
            </div>
            {g.tableOnly
              ? <span className="pill on">Kafede masada</span>
              : g.play
                ? <Link className="btn sm primary" href={`/oyunlar/${g.id}`}>Oyna</Link>
                : <span className="pill">Yakında</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
