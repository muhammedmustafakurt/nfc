import GameGrid from '@/components/GameGrid';
import { notFound } from 'next/navigation';
import Mark from '@/components/Mark';
import { findCafe, MASA_RE } from '@/lib/rooms';
import { GAMES } from '@/lib/games';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const biz = await findCafe(slug);
  return { title: `${biz ? biz.name : 'Oyunlar'} · Masa oyunları` };
}

export default async function TableGames({ params }) {
  const { slug, table } = await params;
  const biz = await findCafe(slug);
  if (!biz || !MASA_RE.test(table)) notFound();
  const base = `/${slug}/${table}/oyunlar`;
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>{biz.name}</h1>
      <p className="lead">Masa {table.replace('masa-', '')}. Aynı masadaki herkes kendi telefonundan katılıp birlikte oynayabilir.</p>
      <GameGrid games={GAMES.filter((g) => g.play)} hrefs={Object.fromEntries(GAMES.filter((g) => g.play).map((g) => [g.id, `${base}/${g.id}`]))} />
    </main>
  );
}
