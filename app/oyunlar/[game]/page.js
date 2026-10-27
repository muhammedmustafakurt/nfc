import Link from 'next/link';
import { notFound } from 'next/navigation';
import Mark from '@/components/Mark';
import Monopoly from '@/components/games/Monopoly';
import Chess from '@/components/games/Chess';
import { GAMES } from '@/lib/games';

const VIEWS = { monopoly: Monopoly, satranc: Chess };

export async function generateMetadata({ params }) {
  const { game } = await params;
  const g = GAMES.find((x) => x.id === game);
  return { title: `${g ? g.name : 'Oyun'} · NFC Kart` };
}

export default async function PlayPage({ params }) {
  const { game } = await params;
  const g = GAMES.find((x) => x.id === game && x.play && !x.tableOnly);
  if (!g) notFound();
  const View = VIEWS[g.id];
  return (
    <main className={`shell${g.id === 'monopoly' ? ' game-board' : ''}`}>
      <header><Mark /></header>
      <h1>{g.name}</h1>
      <View />
      <p><Link href="/oyunlar">← Tüm oyunlar</Link></p>
    </main>
  );
}
