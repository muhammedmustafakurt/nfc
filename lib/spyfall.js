// Casus (Spyfall tarzı) oyunu: bir oyuncu casus, diğerleri aynı gizli mekânda farklı rollerde.
// Oyuncular sırayla soru sorup casusu bulmaya, casus da mekânı anlamaya çalışır.
// Mekân ve casus yalnızca sunucuda tutulur; her telefona sadece kendi kartı gönderilir (viewFor).
export const LOCATIONS = [
  { name: 'Havaalanı', roles: ['Pilot', 'Hostes', 'Pasaport Memuru', 'Yolcu', 'Bagaj Görevlisi'] },
  { name: 'Hastane', roles: ['Doktor', 'Hemşire', 'Hasta', 'Ambulans Şoförü', 'Hasta Yakını'] },
  { name: 'Okul', roles: ['Öğretmen', 'Müdür', 'Öğrenci', 'Kantinci', 'Rehber Öğretmen'] },
  { name: 'Sinema', roles: ['Gişe Görevlisi', 'Seyirci', 'Projeksiyoncu', 'Bilet Kontrolcüsü', 'Mısır Satıcısı'] },
  { name: 'Restoran', roles: ['Aşçı', 'Garson', 'Müşteri', 'Şef', 'Kasiyer'] },
  { name: 'Banka', roles: ['Veznedar', 'Müdür', 'Müşteri', 'Güvenlik Görevlisi', 'Kredi Danışmanı'] },
  { name: 'Plaj', roles: ['Cankurtaran', 'Dondurmacı', 'Tatilci', 'Sörfçü', 'Fotoğrafçı'] },
  { name: 'Otel', roles: ['Resepsiyonist', 'Kat Görevlisi', 'Misafir', 'Komi', 'Otel Müdürü'] },
  { name: 'Tren İstasyonu', roles: ['Makinist', 'Biletçi', 'Yolcu', 'Kondüktör', 'Simitçi'] },
  { name: 'Müze', roles: ['Rehber', 'Güvenlik', 'Ziyaretçi', 'Restoratör', 'Küratör'] },
  { name: 'Kapalıçarşı', roles: ['Esnaf', 'Müşteri', 'Turist', 'Çaycı', 'Halıcı'] },
  { name: 'Hamam', roles: ['Tellak', 'Natır', 'Müşteri', 'Kasiyer', 'Çaycı'] },
  { name: 'Uzay İstasyonu', roles: ['Komutan', 'Mühendis', 'Astronot', 'Bilim İnsanı', 'Doktor'] },
  { name: 'Yolcu Gemisi', roles: ['Kaptan', 'Aşçı', 'Yolcu', 'Tayfa', 'Müzisyen'] },
  { name: 'Karakol', roles: ['Komiser', 'Polis', 'Şüpheli', 'Avukat', 'Gazeteci'] },
  { name: 'Spor Salonu', roles: ['Antrenör', 'Üye', 'Resepsiyonist', 'Diyetisyen', 'Temizlik Görevlisi'] },
  { name: 'Düğün Salonu', roles: ['Gelin', 'Damat', 'Davetli', 'Müzisyen', 'Fotoğrafçı'] },
  { name: 'Lunapark', roles: ['Bilet Satıcısı', 'Ziyaretçi', 'Operatör', 'Palyaço', 'Güvenlik'] },
  { name: 'Kütüphane', roles: ['Kütüphaneci', 'Öğrenci', 'Yazar', 'Araştırmacı', 'Okuyucu'] },
  { name: 'Kafe', roles: ['Barista', 'Garson', 'Müşteri', 'Kasiyer', 'Kafe Sahibi'] },
  { name: 'Süpermarket', roles: ['Kasiyer', 'Reyon Görevlisi', 'Müşteri', 'Müdür', 'Güvenlik'] },
  { name: 'Stadyum', roles: ['Futbolcu', 'Hakem', 'Taraftar', 'Antrenör', 'Spiker'] },
  { name: 'Çiftlik', roles: ['Çiftçi', 'Veteriner', 'Çoban', 'Ziyaretçi', 'Traktör Sürücüsü'] },
  { name: 'Sirk', roles: ['Palyaço', 'Akrobat', 'Jonglör', 'Seyirci', 'Terbiyeci'] },
];

export const DURATION_MS = 8 * 60 * 1000;
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const activeOf = (seats) => seats.map((s, i) => (s.left ? -1 : i)).filter((i) => i >= 0);

export function newGame(n, now = Date.now()) {
  const loc = Math.floor(Math.random() * LOCATIONS.length);
  const pool = shuffle([...LOCATIONS[loc].roles]);
  return {
    loc,
    spy: Math.floor(Math.random() * n),
    roles: Array.from({ length: n }, (_, i) => pool[i % pool.length]),
    startedAt: now,
    endsAt: now + DURATION_MS,
    first: Math.floor(Math.random() * n),
    accused: [], // suçlama başlatmış oyuncular (herkes bir kez)
    vote: null, // { by, target, votes: { [koltuk]: true } }
    note: '',
    over: null, // { winner: 'players' | 'spy' | 'none', text }
  };
}

const finish = (g, winner, text) => ({ ...g, vote: null, over: { winner, text } });

export function accuse(g, seats, by, target) {
  if (g.over) return { error: 'Tur bitti.' };
  if (g.vote) return { error: 'Zaten bir oylama sürüyor.' };
  const act = activeOf(seats);
  if (!act.includes(by) || !act.includes(target) || by === target) return { error: 'Geçersiz suçlama.' };
  if (g.accused.includes(by)) return { error: 'Bu turda zaten bir kez suçlama yaptınız.' };
  const n = { ...g, accused: [...g.accused, by], vote: { by, target, votes: { [by]: true } } };
  n.note = `${seats[by].name}, ${seats[target].name} kişisini casus olmakla suçluyor.`;
  return resolve(n, seats);
}

// Suçlanan dışındaki herkes "evet" derse suçlama sonuçlanır; biri "hayır" derse oylama iptal olur.
export function castVote(g, seats, idx, yes) {
  if (g.over || !g.vote) return { error: 'Açık bir oylama yok.' };
  const act = activeOf(seats);
  if (!act.includes(idx) || idx === g.vote.target) return { error: 'Bu oylamada oy kullanamazsınız.' };
  if (g.vote.votes[idx] !== undefined) return { error: 'Oyunuzu zaten kullandınız.' };
  if (!yes) return { ...g, vote: null, note: `${seats[idx].name} suçlamayı reddetti, oylama iptal oldu.` };
  return resolve({ ...g, vote: { ...g.vote, votes: { ...g.vote.votes, [idx]: true } } }, seats);
}

function resolve(g, seats) {
  const voters = activeOf(seats).filter((i) => i !== g.vote.target);
  if (!voters.every((i) => g.vote.votes[i])) return g;
  const t = g.vote.target;
  return t === g.spy
    ? finish(g, 'players', `Casus yakalandı: ${seats[t].name}. Oyuncular kazandı!`)
    : finish(g, 'spy', `${seats[t].name} casus değildi. Casus kazandı!`);
}

export function guess(g, seats, idx, loc) {
  if (g.over) return { error: 'Tur bitti.' };
  if (idx !== g.spy) return { error: 'Yalnızca casus mekânı tahmin edebilir.' };
  if (!Number.isInteger(loc) || loc < 0 || loc >= LOCATIONS.length) return { error: 'Geçersiz mekân.' };
  return loc === g.loc
    ? finish(g, 'spy', `Casus mekânı bildi: ${LOCATIONS[g.loc].name}. Casus kazandı!`)
    : finish(g, 'players', `Casus "${LOCATIONS[loc].name}" dedi ama mekân ${LOCATIONS[g.loc].name}. Oyuncular kazandı!`);
}

export function timeout(g, now = Date.now()) {
  if (g.over) return g;
  if (now < g.endsAt) return { error: 'Süre henüz dolmadı.' };
  return finish(g, 'spy', 'Süre doldu, casus yakalanamadı. Casus kazandı!');
}

// Oyuncu masadan ayrıldı (seats'te left işaretlendikten sonra çağrılır).
export function onLeave(g, seats, idx) {
  if (g.over) return g;
  if (idx === g.spy) return finish(g, 'players', `Casus (${seats[idx].name}) masadan ayrıldı. Oyuncular kazandı!`);
  if (activeOf(seats).length < 3) return finish(g, 'none', 'Oyuncu sayısı 3\'ün altına indi, tur iptal edildi.');
  let n = g;
  // ayrılan oyuncunun oylaması/suçlaması açıksa iptal et
  if (g.vote && (g.vote.by === idx || g.vote.target === idx)) n = { ...n, vote: null, note: 'Oylama, oyuncu ayrıldığı için iptal oldu.' };
  return n.vote ? resolve(n, seats) : n;
}

// Bir oyuncuya giden görünüm: kendi kartı dışında gizli bilgi içermez. Tur bitince herkes açıklanır.
export function viewFor(g, idx, now = Date.now()) {
  if (!g) return null;
  let over = g.over;
  if (!over && now >= g.endsAt) over = { winner: 'spy', text: 'Süre doldu, casus yakalanamadı. Casus kazandı!' };
  return {
    leftMs: Math.max(0, g.endsAt - now),
    first: g.first,
    accused: g.accused,
    vote: g.vote,
    note: g.note,
    over: over ? { ...over, spy: g.spy, loc: g.loc } : null,
    roles: over ? g.roles : null,
    me: idx < 0 ? null : idx === g.spy ? { spy: true } : { spy: false, loc: g.loc, role: g.roles[idx] },
  };
}
