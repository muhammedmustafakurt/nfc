// Bil Bakalım: herkes aynı soruyu kendi telefonundan, aynı anda cevaplar. Doğru cevap yalnızca süre dolunca ya da
// herkes cevaplayınca açılır. Doğru: 500 puan + kalan süreye göre en çok 500 + üst üste doğru için seri bonusu.
export const ASK_MS = 15 * 1000;
export const REVEAL_MS = 5500;
export const ROUNDS = 10;
const STREAK_BONUS = 100; // her önceki doğru için, en çok 3 kat
export const BASE = 500;

// Her soruda ilk seçenek doğru cevaptır; oyun sırasında karıştırılır.
export const BANK = [
  { c: 'Coğrafya', q: 'Türkiye\'nin başkenti neresidir?', a: ['Ankara', 'İstanbul', 'İzmir', 'Bursa'] },
  { c: 'Coğrafya', q: 'Türkiye\'nin en yüksek dağı hangisidir?', a: ['Ağrı Dağı', 'Erciyes', 'Uludağ', 'Kaçkar Dağı'] },
  { c: 'Coğrafya', q: 'Hangi şehrimiz iki kıtada yer alır?', a: ['İstanbul', 'Ankara', 'Trabzon', 'Edirne'] },
  { c: 'Coğrafya', q: 'Dünyanın en büyük okyanusu hangisidir?', a: ['Pasifik', 'Atlas', 'Hint', 'Arktik'] },
  { c: 'Coğrafya', q: 'Nil Nehri hangi kıtadadır?', a: ['Afrika', 'Asya', 'Avrupa', 'Güney Amerika'] },
  { c: 'Coğrafya', q: 'Japonya\'nın başkenti neresidir?', a: ['Tokyo', 'Kyoto', 'Osaka', 'Seul'] },
  { c: 'Coğrafya', q: 'Türkiye\'nin en büyük gölü hangisidir?', a: ['Van Gölü', 'Tuz Gölü', 'Beyşehir Gölü', 'Eğirdir Gölü'] },
  { c: 'Coğrafya', q: 'Eyfel Kulesi hangi şehirdedir?', a: ['Paris', 'Roma', 'Londra', 'Madrid'] },
  { c: 'Coğrafya', q: 'Avustralya\'nın başkenti neresidir?', a: ['Canberra', 'Sidney', 'Melbourne', 'Perth'] },
  { c: 'Coğrafya', q: 'Peri bacalarıyla ünlü Kapadokya hangi ilimizdedir?', a: ['Nevşehir', 'Konya', 'Sivas', 'Kayseri'] },
  { c: 'Coğrafya', q: 'Pamukkale travertenleri hangi ilimizdedir?', a: ['Denizli', 'Aydın', 'Muğla', 'Antalya'] },
  { c: 'Coğrafya', q: 'İstanbul Boğazı hangi iki denizi birbirine bağlar?', a: ['Karadeniz ve Marmara', 'Marmara ve Ege', 'Akdeniz ve Ege', 'Karadeniz ve Hazar'] },
  { c: 'Coğrafya', q: 'Büyük Giza piramitleri hangi şehrin yakınındadır?', a: ['Kahire', 'Luksor', 'İskenderiye', 'Asvan'] },
  { c: 'Coğrafya', q: 'Brezilya\'da resmî dil hangisidir?', a: ['Portekizce', 'İspanyolca', 'İngilizce', 'Fransızca'] },
  { c: 'Coğrafya', q: 'Dünyanın en yüksek dağı hangisidir?', a: ['Everest', 'K2', 'Kilimanjaro', 'Mont Blanc'] },
  { c: 'Coğrafya', q: 'Yüzölçümüne göre dünyanın en büyük ülkesi hangisidir?', a: ['Rusya', 'Çin', 'ABD', 'Kanada'] },
  { c: 'Coğrafya', q: 'Türkiye\'de kaç il vardır?', a: ['81', '78', '82', '80'] },
  { c: 'Coğrafya', q: 'Ankara\'nın plaka kodu kaçtır?', a: ['06', '34', '35', '16'] },
  { c: 'Tarih', q: 'Türkiye Cumhuriyeti hangi yıl kuruldu?', a: ['1923', '1919', '1938', '1920'] },
  { c: 'Tarih', q: 'İstanbul\'u fetheden Osmanlı padişahı kimdir?', a: ['Fatih Sultan Mehmet', 'Yavuz Sultan Selim', 'Kanuni Sultan Süleyman', 'I. Murad'] },
  { c: 'Tarih', q: 'İstanbul hangi yıl fethedildi?', a: ['1453', '1071', '1299', '1517'] },
  { c: 'Tarih', q: 'Çanakkale Savaşları hangi yıl yaşandı?', a: ['1915', '1912', '1923', '1919'] },
  { c: 'Tarih', q: 'Osmanlı Devleti\'nin kurucusu kimdir?', a: ['Osman Bey', 'Orhan Bey', 'Ertuğrul Gazi', 'I. Murad'] },
  { c: 'Tarih', q: 'Mimar Sinan\'ın Edirne\'deki ustalık eseri hangisidir?', a: ['Selimiye Camii', 'Süleymaniye Camii', 'Sultanahmet Camii', 'Yeni Cami'] },
  { c: 'Tarih', q: 'İnsan Ay\'a ilk kez hangi yıl ayak bastı?', a: ['1969', '1959', '1975', '1981'] },
  { c: 'Tarih', q: 'Fransız Devrimi hangi yıl başladı?', a: ['1789', '1815', '1848', '1700'] },
  { c: 'Tarih', q: 'İkinci Dünya Savaşı hangi yıl sona erdi?', a: ['1945', '1939', '1918', '1950'] },
  { c: 'Tarih', q: 'Titanik gemisi hangi yıl battı?', a: ['1912', '1905', '1920', '1898'] },
  { c: 'Tarih', q: 'Türkiye Cumhuriyeti\'nin ilk cumhurbaşkanı kimdir?', a: ['Mustafa Kemal Atatürk', 'İsmet İnönü', 'Celal Bayar', 'Cemal Gürsel'] },
  { c: 'Tarih', q: 'İstiklal Marşı\'nın şairi kimdir?', a: ['Mehmet Akif Ersoy', 'Nazım Hikmet', 'Ziya Gökalp', 'Yahya Kemal'] },
  { c: 'Bilim', q: 'Suyun kimyasal formülü nedir?', a: ['H2O', 'CO2', 'O2', 'NaCl'] },
  { c: 'Bilim', q: 'Güneş Sistemi\'ndeki en büyük gezegen hangisidir?', a: ['Jüpiter', 'Satürn', 'Neptün', 'Dünya'] },
  { c: 'Bilim', q: '"Kızıl Gezegen" olarak bilinen gezegen hangisidir?', a: ['Mars', 'Venüs', 'Merkür', 'Jüpiter'] },
  { c: 'Bilim', q: 'Yetişkin bir insanın vücudunda kaç kemik vardır?', a: ['206', '150', '312', '180'] },
  { c: 'Bilim', q: 'Dünya, Güneş\'in etrafında yaklaşık kaç günde döner?', a: ['365', '30', '180', '400'] },
  { c: 'Bilim', q: 'Bitkiler fotosentez için hangi gazı alır?', a: ['Karbondioksit', 'Oksijen', 'Azot', 'Hidrojen'] },
  { c: 'Bilim', q: 'Altının element sembolü nedir?', a: ['Au', 'Ag', 'Fe', 'Al'] },
  { c: 'Bilim', q: 'İnsan kalbi kaç odacıktan oluşur?', a: ['4', '2', '3', '6'] },
  { c: 'Bilim', q: 'Doğada bulunan en sert madde hangisidir?', a: ['Elmas', 'Altın', 'Demir', 'Kuvars'] },
  { c: 'Bilim', q: 'Gökkuşağında geleneksel olarak kaç renk sayılır?', a: ['7', '5', '6', '9'] },
  { c: 'Bilim', q: 'Aşağıdakilerden hangisi bir memelidir?', a: ['Yunus', 'Köpekbalığı', 'Ahtapot', 'Kaplumbağa'] },
  { c: 'Bilim', q: 'Dünya\'nın doğal uydusu hangisidir?', a: ['Ay', 'Mars', 'Titan', 'Venüs'] },
  { c: 'Bilim', q: 'Telefonun mucidi olarak bilinen kişi kimdir?', a: ['Alexander Graham Bell', 'Thomas Edison', 'Nikola Tesla', 'Guglielmo Marconi'] },
  { c: 'Bilim', q: 'Görelilik kuramını ortaya atan bilim insanı kimdir?', a: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Stephen Hawking'] },
  { c: 'Bilim', q: 'Yer çekimi yasasıyla anılan bilim insanı kimdir?', a: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'] },
  { c: 'Bilim', q: 'Aziz Sancar hangi alanda Nobel Ödülü aldı?', a: ['Kimya', 'Fizik', 'Edebiyat', 'Barış'] },
  { c: 'Spor', q: 'Futbolda bir takım sahaya kaç oyuncuyla çıkar?', a: ['11', '9', '10', '12'] },
  { c: 'Spor', q: 'Yaz Olimpiyat Oyunları kaç yılda bir yapılır?', a: ['4', '2', '3', '5'] },
  { c: 'Spor', q: '2022 Dünya Kupası\'nı hangi takım kazandı?', a: ['Arjantin', 'Fransa', 'Brezilya', 'Hırvatistan'] },
  { c: 'Spor', q: 'Türkiye 2002 Dünya Kupası\'nı kaçıncı bitirdi?', a: ['Üçüncü', 'İkinci', 'Dördüncü', 'Birinci'] },
  { c: 'Spor', q: 'Wimbledon turnuvası hangi zeminde oynanır?', a: ['Çim', 'Kil', 'Sert zemin', 'Halı'] },
  { c: 'Spor', q: 'Maraton koşusu yaklaşık kaç kilometredir?', a: ['42', '21', '10', '100'] },
  { c: 'Spor', q: 'Satrançta yakalandığında oyunun bittiği taş hangisidir?', a: ['Şah', 'Vezir', 'Kale', 'At'] },
  { c: 'Spor', q: 'Beşiktaş\'ın renkleri hangileridir?', a: ['Siyah-beyaz', 'Sarı-lacivert', 'Sarı-kırmızı', 'Bordo-mavi'] },
  { c: 'Spor', q: 'Muhammed Ali hangi spor dalıyla ünlenmiştir?', a: ['Boks', 'Güreş', 'Karate', 'Tenis'] },
  { c: 'Spor', q: 'Cep Herkülü Naim Süleymanoğlu hangi spor dalındadır?', a: ['Halter', 'Güreş', 'Boks', 'Yüzme'] },
  { c: 'Kültür ve sanat', q: 'Mona Lisa tablosunu kim yapmıştır?', a: ['Leonardo da Vinci', 'Michelangelo', 'Vincent van Gogh', 'Pablo Picasso'] },
  { c: 'Kültür ve sanat', q: '"Yıldızlı Gece" tablosu hangi ressama aittir?', a: ['Vincent van Gogh', 'Claude Monet', 'Salvador Dalí', 'Pablo Picasso'] },
  { c: 'Kültür ve sanat', q: 'Standart bir piyanoda kaç tuş vardır?', a: ['88', '76', '66', '100'] },
  { c: 'Kültür ve sanat', q: 'Harry Potter kitaplarının yazarı kimdir?', a: ['J. K. Rowling', 'J. R. R. Tolkien', 'Dan Brown', 'Roald Dahl'] },
  { c: 'Kültür ve sanat', q: 'Yüzüklerin Efendisi\'nin yazarı kimdir?', a: ['J. R. R. Tolkien', 'J. K. Rowling', 'C. S. Lewis', 'George R. R. Martin'] },
  { c: 'Kültür ve sanat', q: 'Aslan Kral filminin ana karakteri hangisidir?', a: ['Simba', 'Mufasa', 'Scar', 'Timon'] },
  { c: 'Kültür ve sanat', q: 'Sünger Bob\'un en yakın arkadaşı kimdir?', a: ['Patrick', 'Squidward', 'Mr. Krabs', 'Plankton'] },
  { c: 'Kültür ve sanat', q: '"Şımarık" şarkısıyla özdeşleşen sanatçı kimdir?', a: ['Tarkan', 'Sezen Aksu', 'Mustafa Sandal', 'Mabel Matiz'] },
  { c: 'Kültür ve sanat', q: 'Karagöz\'ün gölge oyunundaki arkadaşı kimdir?', a: ['Hacivat', 'Keloğlan', 'Nasreddin Hoca', 'Bekri Mustafa'] },
  { c: 'Kültür ve sanat', q: 'Orhan Pamuk hangi alanda Nobel Ödülü aldı?', a: ['Edebiyat', 'Barış', 'Kimya', 'Tıp'] },
  { c: 'Kültür ve sanat', q: 'Mevlana\'nın türbesi hangi ilimizdedir?', a: ['Konya', 'Kayseri', 'Bursa', 'Sivas'] },
  { c: 'Yemek', q: 'Baklavasıyla meşhur şehrimiz hangisidir?', a: ['Gaziantep', 'Trabzon', 'Rize', 'Edirne'] },
  { c: 'Yemek', q: 'Türkiye\'de çay en çok hangi ilde yetiştirilir?', a: ['Rize', 'Sinop', 'Mersin', 'Muğla'] },
  { c: 'Yemek', q: 'Pizza hangi ülkenin mutfağından gelir?', a: ['İtalya', 'Fransa', 'İspanya', 'Yunanistan'] },
  { c: 'Yemek', q: 'Suşi hangi ülkenin mutfağına aittir?', a: ['Japonya', 'Çin', 'Kore', 'Tayland'] },
  { c: 'Yemek', q: 'Menemen hangi malzemelerle yapılır?', a: ['Yumurta, domates, biber', 'Patates, soğan', 'Nohut, pirinç', 'Süt, un'] },
  { c: 'Yemek', q: 'İskender kebap hangi ilimizle anılır?', a: ['Bursa', 'Adana', 'Şanlıurfa', 'Kars'] },
  { c: 'Genel kültür', q: 'Türkçe alfabede kaç harf vardır?', a: ['29', '28', '26', '31'] },
  { c: 'Genel kültür', q: 'Bir düzine kaç adettir?', a: ['12', '10', '20', '24'] },
  { c: 'Genel kültür', q: 'Kırmızı ile sarı karıştırılınca hangi renk elde edilir?', a: ['Turuncu', 'Yeşil', 'Mor', 'Kahverengi'] },
  { c: 'Genel kültür', q: 'Karada en hızlı koşan hayvan hangisidir?', a: ['Çita', 'Aslan', 'At', 'Tilki'] },
  { c: 'Genel kültür', q: 'Karada yaşayan en büyük hayvan hangisidir?', a: ['Fil', 'Zürafa', 'Gergedan', 'Su aygırı'] },
  { c: 'Genel kültür', q: 'Türk bayrağında hangi semboller yer alır?', a: ['Ay ve yıldız', 'Güneş', 'Kılıç', 'Kartal'] },
  { c: 'Genel kültür', q: 'Nasreddin Hoca\'nın türbesi hangi ilçemizdedir?', a: ['Akşehir', 'Sivrihisar', 'Beypazarı', 'Bolu'] },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const activeSeats = (seats) => seats.map((_, i) => i).filter((i) => !seats[i].left);

// Yeni soruyu açar: seçenekler karıştırılır, doğru cevabın yeri sunucuda kalır.
function ask(g, now) {
  const b = BANK[g.deck[g.turnNo]];
  const opts = shuffle(b.a.map((t, i) => ({ t, right: i === 0 })));
  return {
    ...g,
    phase: 'ask',
    cur: { cat: b.c, q: b.q, opts: opts.map((o) => o.t), ans: opts.findIndex((o) => o.right) },
    picks: g.picks.map(() => null),
    at: g.at.map(() => 0),
    endsAt: now + ASK_MS,
    last: null,
  };
}

export function newGame(n, now = Date.now()) {
  return ask({
    deck: shuffle(BANK.map((_, i) => i)).slice(0, ROUNDS),
    turnNo: 0,
    scores: Array(n).fill(0),
    streak: Array(n).fill(0),
    picks: Array(n).fill(null),
    at: Array(n).fill(0),
    cur: null,
    phase: 'ask',
    endsAt: 0,
    last: null,
    note: '',
    over: null,
  }, now);
}

function finish(g, seats) {
  const ranking = seats.map((_, i) => i).sort((a, b) => (Number(seats[a].left) - Number(seats[b].left)) || (g.scores[b] - g.scores[a]));
  const best = g.scores[ranking[0]];
  const tops = ranking.filter((i) => g.scores[i] === best && !seats[i].left);
  const text = tops.length > 1 ? `Berabere! ${tops.map((i) => seats[i].name).join(' ve ')} ${best} puanla birinci.` : `${seats[ranking[0]].name} kazandı! (${best} puan)`;
  return { ...g, phase: 'over', endsAt: 0, over: { ranking, text }, note: text };
}

// Cevapları puanlar ve doğru cevabı herkese açar.
function reveal(g, now) {
  const scores = [...g.scores];
  const streak = [...g.streak];
  const gains = g.picks.map((p, i) => {
    if (p !== g.cur.ans) { streak[i] = 0; return 0; }
    const pts = BASE + Math.round(500 * g.at[i] / ASK_MS) + Math.min(3, streak[i]) * STREAK_BONUS;
    streak[i] += 1;
    scores[i] += pts;
    return pts;
  });
  return { ...g, phase: 'reveal', endsAt: now + REVEAL_MS, scores, streak, last: { ans: g.cur.ans, picks: [...g.picks], gains } };
}

const allIn = (g, seats) => activeSeats(seats).every((i) => g.picks[i] !== null);

export function pick(g, seats, idx, choice, now = Date.now()) {
  if (g.over || g.phase !== 'ask') return { error: 'Şu an cevap verilemez.' };
  if (now >= g.endsAt) return { error: 'Süre doldu.' };
  if (!Number.isInteger(choice) || choice < 0 || choice >= g.cur.opts.length) return { error: 'Geçersiz seçenek.' };
  if (g.picks[idx] !== null) return { error: 'Bu soruyu zaten cevapladın.' };
  const n = { ...g, picks: g.picks.map((p, i) => (i === idx ? choice : p)), at: g.at.map((t, i) => (i === idx ? g.endsAt - now : t)) };
  return allIn(n, seats) ? reveal(n, now) : n;
}

// Süre dolduysa soruyu kapatır ya da sonraki soruya geçer; dolmadıysa durum değişmez.
export function timeout(g, seats, now = Date.now()) {
  if (g.over || now < g.endsAt) return g;
  if (g.phase === 'ask') return reveal(g, now);
  const n = { ...g, turnNo: g.turnNo + 1 };
  return n.turnNo >= ROUNDS ? finish(n, seats) : ask(n, now);
}

// Oyuncu masadan ayrıldı (seats'te left işaretlendikten sonra çağrılır).
export function onLeave(g, seats, idx, now = Date.now()) {
  if (g.over) return g;
  if (activeSeats(seats).length === 0) return finish(g, seats);
  return g.phase === 'ask' && allIn(g, seats) ? reveal(g, now) : g;
}

// Bir oyuncuya giden görünüm: doğru cevap ve başkalarının seçimi yalnızca soru kapanınca açılır.
export function viewFor(g, idx, now = Date.now()) {
  if (!g) return null;
  const open = g.phase === 'reveal';
  return {
    phase: g.phase,
    turnNo: g.turnNo,
    total: ROUNDS,
    scores: g.scores,
    streak: g.streak,
    leftMs: g.phase === 'over' ? 0 : Math.max(0, g.endsAt - now),
    cat: g.phase === 'over' ? null : g.cur.cat,
    q: g.phase === 'over' ? null : g.cur.q,
    opts: g.phase === 'over' ? [] : g.cur.opts,
    mine: idx >= 0 ? g.picks[idx] : null,
    answered: g.picks.map((p) => p !== null),
    ans: open ? g.last.ans : null,
    picks: open ? g.last.picks : null,
    gains: open ? g.last.gains : null,
    note: g.note,
    over: g.over,
  };
}
