// Kafeler için pazar analizi: masada oynanan popüler kutu oyunları.
// play: true olanlar telefonda oynanır; diğerleri listede "Yakında" görünür.
export const GAMES = [
  { id: 'monopoly', icon: '👑', color: '#2438e8', tag: 'Strateji', name: 'Emlak Krallığı', players: '2-4', minutes: '60-120', note: 'Mülk al, kira topla', play: true },
  { id: 'satranc', icon: '♟️', color: '#3a4a7a', tag: 'Strateji', name: 'Satranç', players: '2', minutes: '20-60', note: 'Stratejinin başı', play: true },
  { id: 'spyfall', icon: '🕵️', color: '#7a4b2a', tag: 'Gizli rol', name: 'Casus', players: '3-8', minutes: '8-10', note: 'Casusu bul, mekânı sakla', play: true, tableOnly: true },
  { id: 'ajanlar', icon: '🗝️', color: '#c0261e', tag: 'Takım', name: 'Gizli Ajanlar', players: '4-8', minutes: '15-20', note: 'İpucu ver, ajanları bul', play: true, tableOnly: true },
  { id: 'vampir', icon: '🧛', color: '#8a3fd1', tag: 'Gizli rol', name: 'Vampir Köylü', players: '5-10', minutes: '20-30', note: 'Geceleri vampirler avlanır', play: true, tableOnly: true },
  { id: 'tabu', icon: '🚫', color: '#d6407f', tag: 'Takım', name: 'Tabu', players: '4-10', minutes: '15-20', note: 'Yasaklı kelimeleri söylemeden anlat', play: true, tableOnly: true },
  { id: 'kimim', icon: '🎭', color: '#0e8fa8', tag: 'Parti', name: 'Ben Kimim?', players: '3-10', minutes: '10-15', note: 'Alnındaki kartı tahmin et', play: true, tableOnly: true },
  { id: 'cizim', icon: '🎨', color: '#d98a00', tag: 'Parti', name: 'Çiz Bakalım', players: '3-10', minutes: '15-20', note: 'Çiz, arkadaşların tahmin etsin', play: true, tableOnly: true },
  { id: 'bil', icon: '🧠', color: '#1f9d6b', tag: 'Bilgi', name: 'Bil Bakalım', players: '2-10', minutes: '5-8', note: 'Hızlı bil, puanı kap', play: true, tableOnly: true },
  { id: 'catan', icon: '🌾', color: '#8b5a2b', tag: 'Strateji', name: 'Catan', players: '3-4', minutes: '60-90', note: 'Kaynak topla, ticaret yap' },
  { id: 'risk', icon: '🌍', color: '#5a6b1f', tag: 'Strateji', name: 'Risk', players: '2-6', minutes: '90-120', note: 'Dünyayı fethet' },
  { id: 'cluedo', icon: '🔍', color: '#6b2d5c', tag: 'Gizem', name: 'Cluedo', players: '3-6', minutes: '45', note: 'Katili bul' },
  { id: 'scrabble', icon: '🔤', color: '#b5651d', tag: 'Kelime', name: 'Scrabble', players: '2-4', minutes: '60', note: 'Harflerle kelime kur' },
  { id: 'ticket', icon: '🚂', color: '#1d6fa5', tag: 'Strateji', name: 'Ticket to Ride', players: '2-5', minutes: '45-60', note: 'Tren hatlarını birleştir' },
  { id: 'carcassonne', icon: '🏰', color: '#6f7d3a', tag: 'Strateji', name: 'Carcassonne', players: '2-5', minutes: '35', note: 'Karo koy, şehir kur' },
  { id: 'azul', icon: '🔷', color: '#2a6fb0', tag: 'Strateji', name: 'Azul', players: '2-4', minutes: '30-45', note: 'Fayanslarla duvar ör' },
];
