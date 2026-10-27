export const BRAND = 'NFC Kart';

// Sipariş butonları bu numaraya WhatsApp mesajı açar (.env.local içinde WHATSAPP_NUMBER=905xxxxxxxxx).
export const whatsappNumber = () => (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '');

export function orderLink(text) {
  const n = whatsappNumber();
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
