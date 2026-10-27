'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { run } from '@/lib/db';
import { GAME_IDS } from '@/lib/games';

// Bir ziyaretçi her oyuna bir kez oy verebilir (tarayıcı çerezi ile; kesin koruma değil, analiz içindir).
export async function voteGame(formData) {
  const id = String(formData.get('game') || '');
  if (!GAME_IDS.has(id)) return;
  const jar = await cookies();
  const voted = (jar.get('gv')?.value || '').split(',').filter(Boolean);
  if (voted.includes(id)) return;
  await run(
    'INSERT INTO game_votes (game, votes) VALUES (?, 1) ON CONFLICT (game) DO UPDATE SET votes = game_votes.votes + 1',
    id,
  );
  jar.set('gv', [...voted, id].join(','), { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax', httpOnly: true });
  revalidatePath('/oyunlar');
}
