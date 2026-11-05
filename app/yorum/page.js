import Mark from '@/components/Mark';
import PlaceFinder from '@/components/PlaceFinder';

export const metadata = { title: 'Google yorum linki bulucu · NFC Kart', robots: { index: false } };

export default function ReviewPage() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Google yorum linki</h1>
      <p className="lead">İşletmenizi arayın, Place ID'sini ve müşterileri doğrudan Google yorum ekranına götüren linki alın.</p>
      <PlaceFinder />
    </main>
  );
}
