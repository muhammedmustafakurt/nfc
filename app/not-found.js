import Link from 'next/link';
import Mark from '@/components/Mark';

export default function NotFound() {
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Bu adreste işletme yok</h1>
      <p className="lead">Linki kontrol edin ya da kartınızı yeniden okutun.</p>
      <Link className="btn" href="/">Ana sayfaya dön</Link>
    </main>
  );
}
