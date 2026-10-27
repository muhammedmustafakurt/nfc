import { redirect } from 'next/navigation';

// Karekod doğrudan masanın oyun listesine açılır.
export default async function TablePage({ params }) {
  const { slug, table } = await params;
  redirect(`/${slug}/${table}/oyunlar`);
}
