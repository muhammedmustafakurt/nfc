import Mark from '@/components/Mark';
import ShortenTool from '@/components/ShortenTool';

export const metadata = { title: 'Link kısaltıcı · NFC Kart', robots: { index: false } };

export default function ShortenPage() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Link kısaltıcı</h1>
      <p className="lead">Uzun bir adresi yapıştırın, kısa linki alın. Kısa link açılınca doğrudan girdiğiniz adrese gider.</p>
      <ShortenTool />
    </main>
  );
}
