// Kafeler için pazar analizi: en popüler 10 masa oyunu. Ziyaretçiler "Oynamak istiyorum" ile oy verir.
export const GAMES = [
  { id: 'monopoly', name: 'Emlak Krallığı', players: '2-6', minutes: '60-120', note: 'Mülk al, kira topla' },
  { id: 'tavla', name: 'Tavla', players: '2', minutes: '15-30', note: 'Kafelerin klasiği' },
  { id: 'okey', name: 'Okey', players: '4', minutes: '30-60', note: 'Taşlarla seri ve per' },
  { id: 'uno', name: 'Uno', players: '2-10', minutes: '15-30', note: 'Renk ve sayı eşleştir' },
  { id: 'catan', name: 'Catan', players: '3-4', minutes: '60-90', note: 'Kaynak topla, ticaret yap' },
  { id: 'satranc', name: 'Satranç', players: '2', minutes: '20-60', note: 'Stratejinin başı' },
  { id: 'jenga', name: 'Jenga', players: '2+', minutes: '15', note: 'Kule yıkılmasın' },
  { id: 'dobble', name: 'Dobble', players: '2-8', minutes: '15', note: 'Ortak sembolü ilk bul' },
  { id: 'activity', name: 'Activity', players: '4+', minutes: '45', note: 'Anlat, çiz, canlandır' },
  { id: 'vampir', name: 'Vampir Köylü', players: '6-15', minutes: '30-45', note: 'Kalabalık masalara' },
];

export const GAME_IDS = new Set(GAMES.map((g) => g.id));
