import Link from 'next/link';

// Marka işareti: kart okutulurken yayılan temas dalgaları
export default function Mark({ href = '/' }) {
  return (
    <Link href={href} className="mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M5 8.5a5.5 5.5 0 0 1 0 7" />
        <path d="M9.5 5.5a10 10 0 0 1 0 13" />
        <path d="M14 2.5a14.5 14.5 0 0 1 0 19" />
      </svg>
      NFC Kart
    </Link>
  );
}
