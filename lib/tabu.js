// Tabu: iki takım sırayla oynar. Sırası gelen takımdan bir oyuncu (anlatıcı) kartı görür ve ekrandaki kelimeyi
// yasaklı kelimeleri söylemeden anlatır; takım arkadaşları tahmin eder, rakip takım kartı izleyip hakemlik yapar.
// Doğru: +1, tabu (yasaklı kelime söylendi): −1, pas hakkı turda 3. Kart yalnızca anlatıcıya ve rakip takıma gider.
export const TEAM = { r: 'Kırmızı', b: 'Mavi' };
export const TURN_MS = 60 * 1000;
export const TURN_OPTIONS = [30, 45, 60, 90, 120]; // saniye; lobide seçilir
export const PASSES = 3;
export const ROUNDS = 2; // her oyuncu en az bu kadar kez anlatır

export const CARDS = [
  { w: 'Çay', t: ['demlik', 'bardak', 'sıcak', 'şeker', 'Rize'] },
  { w: 'Kahve', t: ['fincan', 'Türk', 'telve', 'sütlü', 'kafein'] },
  { w: 'Simit', t: ['susam', 'fırın', 'halka', 'çay', 'kahvaltı'] },
  { w: 'Pasta', t: ['doğum günü', 'mum', 'tatlı', 'krema', 'dilim'] },
  { w: 'Dondurma', t: ['soğuk', 'külah', 'yaz', 'vanilya', 'erimek'] },
  { w: 'Pizza', t: ['İtalyan', 'peynir', 'dilim', 'fırın', 'hamur'] },
  { w: 'Hamburger', t: ['ekmek', 'köfte', 'patates', 'fast food', 'peynir'] },
  { w: 'Çorba', t: ['kaşık', 'sıcak', 'mercimek', 'tuz', 'kış'] },
  { w: 'Balık', t: ['deniz', 'olta', 'yüzgeç', 'ızgara', 'kılçık'] },
  { w: 'Kedi', t: ['miyav', 'evcil', 'tüy', 'köpek', 'fare'] },
  { w: 'Köpek', t: ['havlamak', 'evcil', 'kemik', 'kedi', 'sadık'] },
  { w: 'Aslan', t: ['hayvanat bahçesi', 'yele', 'kral', 'orman', 'kükremek'] },
  { w: 'Araba', t: ['tekerlek', 'direksiyon', 'motor', 'benzin', 'yol'] },
  { w: 'Uçak', t: ['havaalanı', 'pilot', 'kanat', 'bilet', 'uçmak'] },
  { w: 'Tren', t: ['ray', 'istasyon', 'vagon', 'lokomotif', 'bilet'] },
  { w: 'Gemi', t: ['deniz', 'kaptan', 'liman', 'yelken', 'güverte'] },
  { w: 'Bisiklet', t: ['pedal', 'tekerlek', 'sürmek', 'zincir', 'gidon'] },
  { w: 'Telefon', t: ['aramak', 'ekran', 'numara', 'cep', 'mesaj'] },
  { w: 'Bilgisayar', t: ['klavye', 'fare', 'ekran', 'internet', 'program'] },
  { w: 'Televizyon', t: ['kanal', 'kumanda', 'dizi', 'ekran', 'izlemek'] },
  { w: 'Saat', t: ['kol', 'akrep', 'yelkovan', 'zaman', 'çalmak'] },
  { w: 'Gözlük', t: ['göz', 'cam', 'burun', 'miyop', 'takmak'] },
  { w: 'Şemsiye', t: ['yağmur', 'açmak', 'ıslak', 'sap', 'korumak'] },
  { w: 'Ayna', t: ['yansıma', 'bakmak', 'cam', 'yüz', 'kırılmak'] },
  { w: 'Anahtar', t: ['kapı', 'kilit', 'açmak', 'çilingir', 'deste'] },
  { w: 'Kitap', t: ['okumak', 'sayfa', 'yazar', 'kütüphane', 'roman'] },
  { w: 'Kalem', t: ['yazmak', 'kâğıt', 'kurşun', 'silgi', 'tükenmez'] },
  { w: 'Okul', t: ['öğrenci', 'öğretmen', 'ders', 'zil', 'sınıf'] },
  { w: 'Hastane', t: ['doktor', 'hemşire', 'hasta', 'ameliyat', 'acil'] },
  { w: 'Doktor', t: ['hasta', 'hastane', 'ilaç', 'muayene', 'beyaz önlük'] },
  { w: 'Polis', t: ['suç', 'hırsız', 'karakol', 'tutuklamak', 'üniforma'] },
  { w: 'İtfaiyeci', t: ['yangın', 'su', 'hortum', 'kırmızı', 'söndürmek'] },
  { w: 'Aşçı', t: ['mutfak', 'yemek', 'şef', 'pişirmek', 'tencere'] },
  { w: 'Futbol', t: ['top', 'kale', 'gol', 'hakem', 'maç'] },
  { w: 'Basketbol', t: ['pota', 'top', 'sayı', 'smaç', 'NBA'] },
  { w: 'Yüzmek', t: ['havuz', 'deniz', 'mayo', 'su', 'kulaç'] },
  { w: 'Dans', t: ['müzik', 'ritim', 'oynamak', 'adım', 'halay'] },
  { w: 'Gitar', t: ['tel', 'çalmak', 'müzik', 'akort', 'akustik'] },
  { w: 'Piyano', t: ['tuş', 'siyah', 'beyaz', 'çalmak', 'kuyruklu'] },
  { w: 'Sinema', t: ['film', 'bilet', 'perde', 'patlamış mısır', 'salon'] },
  { w: 'Tiyatro', t: ['sahne', 'oyuncu', 'perde', 'seyirci', 'oyun'] },
  { w: 'Düğün', t: ['gelin', 'damat', 'davul', 'nikâh', 'davetli'] },
  { w: 'Doğum günü', t: ['pasta', 'mum', 'hediye', 'kutlamak', 'yaş'] },
  { w: 'Bayram', t: ['şeker', 'harçlık', 'kurban', 'tatil', 'ziyaret'] },
  { w: 'Yılbaşı', t: ['gece', 'kutlamak', 'hindi', 'çam', 'hediye'] },
  { w: 'Tatil', t: ['otel', 'deniz', 'dinlenmek', 'izin', 'valiz'] },
  { w: 'Valiz', t: ['tatil', 'seyahat', 'bagaj', 'çanta', 'tekerlek'] },
  { w: 'Pasaport', t: ['yurtdışı', 'vize', 'kimlik', 'havaalanı', 'fotoğraf'] },
  { w: 'Para', t: ['cüzdan', 'banka', 'lira', 'harcamak', 'kâğıt'] },
  { w: 'Banka', t: ['para', 'kredi', 'ATM', 'hesap', 'şube'] },
  { w: 'Ev', t: ['oda', 'kapı', 'mutfak', 'aile', 'çatı'] },
  { w: 'Yatak', t: ['uyumak', 'yastık', 'gece', 'battaniye', 'rahat'] },
  { w: 'Buzdolabı', t: ['soğuk', 'yiyecek', 'mutfak', 'dondurucu', 'kapak'] },
  { w: 'Çamaşır makinesi', t: ['yıkamak', 'kirli', 'deterjan', 'kıyafet', 'sıkma'] },
  { w: 'Süpürge', t: ['temizlik', 'toz', 'elektrik', 'halı', 'yer'] },
  { w: 'Diş fırçası', t: ['macun', 'diş', 'sabah', 'ağız', 'temizlemek'] },
  { w: 'Sabun', t: ['yıkamak', 'köpük', 'el', 'banyo', 'koku'] },
  { w: 'Şampuan', t: ['saç', 'banyo', 'köpük', 'yıkamak', 'bakım'] },
  { w: 'Güneş', t: ['sıcak', 'gökyüzü', 'gündüz', 'ışık', 'yaz'] },
  { w: 'Ay', t: ['gece', 'gökyüzü', 'dolunay', 'uydu', 'yıldız'] },
  { w: 'Kar', t: ['kış', 'beyaz', 'soğuk', 'kardan adam', 'yağmak'] },
  { w: 'Yağmur', t: ['ıslak', 'bulut', 'şemsiye', 'damla', 'yağmak'] },
  { w: 'Deniz', t: ['mavi', 'dalga', 'tuzlu', 'plaj', 'yüzmek'] },
  { w: 'Dağ', t: ['tırmanmak', 'zirve', 'yüksek', 'kar', 'yamaç'] },
  { w: 'Orman', t: ['ağaç', 'yeşil', 'hayvan', 'kamp', 'yaprak'] },
  { w: 'Ağaç', t: ['yaprak', 'dal', 'orman', 'kök', 'meyve'] },
  { w: 'Çiçek', t: ['koku', 'bahçe', 'gül', 'renkli', 'bitki'] },
  { w: 'Balon', t: ['hava', 'şişirmek', 'patlamak', 'renkli', 'ip'] },
  { w: 'Mum', t: ['yanmak', 'ateş', 'balmumu', 'pasta', 'ışık'] },
  { w: 'Ateş', t: ['yanmak', 'kıvılcım', 'sıcak', 'alev', 'kibrit'] },
  { w: 'Kibrit', t: ['ateş', 'çakmak', 'çöp', 'yakmak', 'kutu'] },
  { w: 'Hırsız', t: ['çalmak', 'polis', 'kapı', 'gece', 'hapis'] },
  { w: 'Korsan', t: ['gemi', 'deniz', 'hazine', 'kılıç', 'papağan'] },
  { w: 'Sihirbaz', t: ['hüner', 'şapka', 'tavşan', 'değnek', 'numara'] },
  { w: 'Robot', t: ['makine', 'metal', 'insan', 'yapay', 'kumanda'] },
  { w: 'Astronot', t: ['uzay', 'roket', 'ay', 'kask', 'NASA'] },
  { w: 'Dedektif', t: ['ipucu', 'suç', 'bulmak', 'Sherlock', 'büyüteç'] },
  { w: 'Prenses', t: ['kral', 'taç', 'masal', 'kale', 'prens'] },
  { w: 'Ejderha', t: ['ateş', 'masal', 'kanat', 'mağara', 'pul'] },
  { w: 'Çikolata', t: ['tatlı', 'kakao', 'bar', 'sütlü', 'kahverengi'] },
];

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const other = (t) => (t === 'r' ? 'b' : 'r');
const activeIn = (g, seats, team) => g.order[team].filter((i) => !seats[i].left);

// Sıradaki anlatıcıyı seçer: takım sırayla döner, ayrılanlar atlanır.
function nextTurn(g, seats) {
  const team = g.turnNo % 2 === 0 ? 'r' : 'b';
  const members = activeIn(g, seats, team);
  return { team, describer: members[Math.floor(g.turnNo / 2) % members.length], phase: 'ready', endsAt: 0, card: null, passes: PASSES, log: [] };
}

export function newGame(n, seats, ms) {
  const turnMs = TURN_OPTIONS.includes(Math.round(Number(ms) / 1000)) ? Math.round(Number(ms) / 1000) * 1000 : TURN_MS;
  const order = shuffle([...Array(n).keys()]);
  const teams = Array(n);
  order.forEach((seat, k) => { teams[seat] = k % 2 === 0 ? 'r' : 'b'; });
  const lists = { r: order.filter((s) => teams[s] === 'r'), b: order.filter((s) => teams[s] === 'b') };
  const g = {
    turnMs,
    teams,
    order: lists,
    total: Math.max(lists.r.length, lists.b.length) * ROUNDS * 2,
    turnNo: 0,
    deck: shuffle(CARDS.map((_, i) => i)),
    deckPos: 0,
    score: { r: 0, b: 0 },
    turn: null,
    history: [],
    note: '',
    over: null,
  };
  g.turn = nextTurn(g, seats);
  g.note = `${TEAM.r} takım başlıyor. Anlatıcı hazır olunca "Başla" der.`;
  return g;
}

const drawCard = (g) => ({ card: g.deck[g.deckPos % g.deck.length], deckPos: g.deckPos + 1 });

function endTurn(g, seats) {
  const t = g.turn;
  const correct = t.log.filter((x) => x.r === 'ok').length;
  const tabu = t.log.filter((x) => x.r === 'tabu').length;
  const entry = { team: t.team, describer: t.describer, log: t.log, delta: correct - tabu };
  const n = { ...g, history: [...g.history, entry], turnNo: g.turnNo + 1 };
  if (n.turnNo >= n.total) {
    const d = n.score.r - n.score.b;
    if (d === 0) {
      // Beraberlik: her takıma bir el daha verilir (uzatma eli), fark çıkana kadar sürer.
      const turn = nextTurn({ ...n, total: n.total + 2 }, seats);
      return { ...n, total: n.total + 2, overtime: (n.overtime || 0) + 1, turn, note: `Berabere! İki takım da ${n.score.r} puan. Uzatma eli: ${TEAM.r} takım başlıyor.` };
    }
    const text = d === 0 ? `Berabere! İki takım da ${n.score.r} puan.` : `${TEAM[d > 0 ? 'r' : 'b']} takım kazandı! (${n.score.r} - ${n.score.b})`;
    return { ...n, turn: { ...t, phase: 'over', card: null, endsAt: 0 }, over: { winner: d === 0 ? 'none' : d > 0 ? 'r' : 'b', text }, note: text };
  }
  const turn = nextTurn(n, seats);
  return { ...n, turn, note: `Tur bitti: ${correct} doğru, ${tabu} tabu (${correct - tabu >= 0 ? '+' : ''}${correct - tabu}). Sıra ${TEAM[turn.team]} takımda.` };
}

// Süresi dolmuş turu kapatır.
function settle(g, seats, now) {
  return g.turn.phase === 'run' && now >= g.turn.endsAt ? endTurn(g, seats) : g;
}

export function begin(g0, seats, idx, now = Date.now()) {
  const g = settle(g0, seats, now);
  if (g.over) return { error: 'Oyun bitti.' };
  if (g.turn.phase !== 'ready') return { error: 'Tur zaten başladı.' };
  if (g.turn.describer !== idx) return { error: 'Turu yalnızca anlatıcı başlatabilir.' };
  const { card, deckPos } = drawCard(g);
  return { ...g, deckPos, turn: { ...g.turn, phase: 'run', endsAt: now + (g.turnMs || TURN_MS), card }, note: `${seats[idx].name} anlatıyor!` };
}

function advance(g, res, delta, now) {
  const { card, deckPos } = drawCard(g);
  const t = g.turn;
  return {
    ...g,
    deckPos,
    score: { ...g.score, [t.team]: g.score[t.team] + delta },
    turn: { ...t, card, passes: res === 'pas' ? t.passes - 1 : t.passes, log: [...t.log, { w: CARDS[t.card].w, r: res }] },
  };
}

export function act(g0, seats, idx, type, now = Date.now()) {
  const g = settle(g0, seats, now);
  if (g.over) return { error: 'Oyun bitti.' };
  const t = g.turn;
  if (t.phase !== 'run') return { error: 'Tur şu an çalışmıyor.' };
  if (type === 'right' || type === 'pass') {
    if (t.describer !== idx) return { error: 'Bu işlemi yalnızca anlatıcı yapabilir.' };
    if (type === 'pass' && t.passes <= 0) return { error: 'Pas hakkın kalmadı.' };
    return advance(g, type === 'right' ? 'ok' : 'pas', type === 'right' ? 1 : 0, now);
  }
  if (type === 'taboo') {
    if (g.teams[idx] === t.team) return { error: 'Tabu demek rakip takımın görevi.' };
    return advance(g, 'tabu', -1, now);
  }
  return { error: 'Bilinmeyen işlem.' };
}

export function timeout(g, seats, now = Date.now()) {
  if (g.over) return g;
  if (g.turn.phase !== 'run' || now < g.turn.endsAt) return { error: 'Süre henüz dolmadı.' };
  return endTurn(g, seats);
}

// Oyuncu masadan ayrıldı (seats'te left işaretlendikten sonra çağrılır).
export function onLeave(g, seats, idx) {
  if (g.over) return g;
  for (const team of ['r', 'b']) {
    if (activeIn(g, seats, team).length === 0) {
      const text = `${TEAM[team]} takımda oyuncu kalmadı, oyun iptal edildi.`;
      return { ...g, over: { winner: 'none', text }, turn: { ...g.turn, phase: 'over', card: null }, note: text };
    }
  }
  if (g.turn.describer === idx) return endTurn(g, seats); // anlatıcı ayrıldı: tur atlanır
  return g;
}

// Bir oyuncuya giden görünüm: kart yalnızca anlatıcıya ve rakip takıma açıktır.
export function viewFor(g, idx, now = Date.now()) {
  if (!g) return null;
  const t = g.turn;
  const team = idx < 0 ? null : g.teams[idx];
  const sees = !g.over && t.phase === 'run' && t.card !== null && team !== null && (t.describer === idx || team !== t.team);
  return {
    teams: g.teams,
    order: g.order,
    score: g.score,
    turnNo: g.turnNo,
    total: g.total,
    turnMs: g.turnMs || TURN_MS,
    overtime: g.overtime || 0,
    turn: {
      team: t.team,
      describer: t.describer,
      phase: t.phase,
      passes: t.passes,
      leftMs: t.phase === 'run' ? Math.max(0, t.endsAt - now) : 0,
      ok: t.log.filter((x) => x.r === 'ok').length,
      tabu: t.log.filter((x) => x.r === 'tabu').length,
      card: sees ? { w: CARDS[t.card].w, t: CARDS[t.card].t } : null,
    },
    history: g.history.slice(-6),
    note: g.note,
    over: g.over,
    me: team ? { team, describer: t.describer === idx, judge: team !== t.team } : null,
  };
}
