import Mark from '@/components/Mark';
import PlaceFinder from '@/components/PlaceFinder';

export const metadata = { title: 'Google yorum linki bulucu · NFC Kart', robots: { index: false } };

export default function ReviewPage() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Google yorum linki</h1>
      <p className="lead">Google Haritalar'daki işletme linklerini alt alta yapıştırın; her biri için Place ID'yi ve müşteriyi doğrudan Google yorum ekranına götüren linki alın. Haritalar'da işletmeyi açıp "Paylaş"a basınca çıkan link yeterli.</p>
      <PlaceFinder />
    </main>
  );
}
