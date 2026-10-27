import { orderLink } from '@/lib/site';

// WhatsApp'a hazır mesajla yönlendiren sipariş butonu.
// Numara ayarlanmamışsa canlıda hiçbir şey çizmez, geliştirme sırasında uyarı gösterir.
export default function OrderButton({ text = 'Merhaba, NFC kart sipariş etmek istiyorum.', className = 'lp-btn', children = "WhatsApp'tan sipariş ver" }) {
  const href = orderLink(text);
  if (!href) {
    return process.env.NODE_ENV === 'production' ? null : (
      <span className="lp-dev-note">WHATSAPP_NUMBER ayarlanmadı (.env.local)</span>
    );
  }
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
