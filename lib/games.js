// Kafeler için pazar analizi: masada oynanan 10 popüler kutu oyunu.
// play: true olanlar telefonda oynanır; diğerlerinde ziyaretçi "Oynamak istiyorum" ile ilgisini bildirir.
export const GAMES = [
  { id: 'monopoly', name: 'Emlak Krallığı', players: '2-4', minutes: '60-120', note: 'Mülk al, kira topla', play: true },
  { id: 'jenga', name: 'Jenga', players: '2+', minutes: '15', note: 'Kule yıkılmasın', play: true },
  { id: 'satranc', name: 'Satranç', players: '2', minutes: '20-60', note: 'Stratejinin başı', play: true },
  { id: 'catan', name: 'Catan', players: '3-4', minutes: '60-90', note: 'Kaynak topla, ticaret yap' },
  { id: 'risk', name: 'Risk', players: '2-6', minutes: '90-120', note: 'Dünyayı fethet' },
  { id: 'cluedo', name: 'Cluedo', players: '3-6', minutes: '45', note: 'Katili bul' },
  { id: 'scrabble', name: 'Scrabble', players: '2-4', minutes: '60', note: 'Harflerle kelime kur' },
  { id: 'ticket', name: 'Ticket to Ride', players: '2-5', minutes: '45-60', note: 'Tren hatlarını birleştir' },
  { id: 'carcassonne', name: 'Carcassonne', players: '2-5', minutes: '35', note: 'Karo koy, şehir kur' },
  { id: 'azul', name: 'Azul', players: '2-4', minutes: '30-45', note: 'Fayanslarla duvar ör' },
];

export const GAME_IDS = new Set(GAMES.map((g) => g.id));
