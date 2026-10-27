import Link from 'next/link';
import { notFound } from 'next/navigation';
import Mark from '@/components/Mark';
import MonopolyOnline from '@/components/games/MonopolyOnline';
import ChessOnline from '@/components/games/ChessOnline';
import SpyfallOnline from '@/components/games/SpyfallOnline';
import AjanlarOnline from '@/components/games/AjanlarOnline';
import VampirOnline from '@/components/games/VampirOnline';
import TabuOnline from '@/components/games/TabuOnline';
import KimimOnline from '@/components/games/KimimOnline';
import { findCafe, MASA_RE } from '@/lib/rooms';
import { GAMES } from '@/lib/games';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { game } = await params;
  const g = GAMES.find((x) => x.id === game);
  return { title: `${g ? g.name : 'Oyun'} · NFC Kart` };
}

export default async function TablePlay({ params }) {
  const { slug, table, game } = await params;
  const g = GAMES.find((x) => x.id === game && x.play);
  const biz = await findCafe(slug);
  if (!g || !biz || !MASA_RE.test(table)) notFound();
  return (
    <main className={`shell${g.id === 'monopoly' ? ' game-board' : ''}`}>
      <header><Mark /></header>
      <h1>{g.name}</h1>
      <p className="mono-where">{biz.name} · Masa {table.replace('masa-', '')}</p>
      {g.id === 'monopoly' && <MonopolyOnline cafe={slug} masa={table} />}
      {g.id === 'satranc' && <ChessOnline cafe={slug} masa={table} />}
      {g.id === 'spyfall' && <SpyfallOnline cafe={slug} masa={table} />}
      {g.id === 'ajanlar' && <AjanlarOnline cafe={slug} masa={table} />}
      {g.id === 'vampir' && <VampirOnline cafe={slug} masa={table} />}
      {g.id === 'tabu' && <TabuOnline cafe={slug} masa={table} />}
      {g.id === 'kimim' && <KimimOnline cafe={slug} masa={table} />}
      <p><Link href={`/${slug}/${table}/oyunlar`}>← Tüm oyunlar</Link></p>
    </main>
  );
}
