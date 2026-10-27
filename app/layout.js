import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const font = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], variable: '--font', display: 'swap' });

export const metadata = {
  title: 'NFC Kart',
  robots: { index: false },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#2438e8' };

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}
