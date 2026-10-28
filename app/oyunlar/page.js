import GameGrid from '@/components/GameGrid';
import Mark from '@/components/Mark';
import { GAMES } from '@/lib/games';

export const metadata = { title: 'Masa oyunları · NFC Kart' };

export default function GamesPage() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Masa oyunları</h1>
      <p className="lead">Telefonda hemen oynayın.</p>
      <GameGrid filter={false} games={GAMES} hrefs={Object.fromEntries(GAMES.filter((g) => g.play && !g.tableOnly).map((g) => [g.id, `/oyunlar/${g.id}`]))} />
    </main>
  );
}
