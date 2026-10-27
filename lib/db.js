import { neon } from '@neondatabase/serverless';

// Neon (sunucusuz Postgres). Bağlantı adresi DATABASE_URL ortam değişkeninden gelir.
// Çağrı yerleri `?` yer tutucusuyla yazılır; burada Postgres'in $1, $2 biçimine çevrilir.

const g = globalThis;

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ayarlanmamış. Neon bağlantı adresini .env.local dosyasına ekleyin.');
  return (g.__neonSql ??= neon(url));
}

const toPg = (text) => {
  let i = 0;
  return text.replace(/\?/g, () => `$${++i}`);
};

// Tablolar, her sunucu örneğinde ilk sorguda bir kez oluşturulur (Neon tek sorguda tek ifade çalıştırır).
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'iban',
    value TEXT,
    extra TEXT,
    taps INTEGER NOT NULL DEFAULT 0,
    ref_hash TEXT UNIQUE,
    email TEXT UNIQUE,
    pass_hash TEXT,
    pass_salt TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
  )`,
  // Ana admin ortam değişkenlerinden gelir; buradakiler panelden eklenen ek yöneticilerdir.
  `CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    pass_salt TEXT NOT NULL,
    created_at BIGINT NOT NULL
  )`,
  // Kafe masalarındaki çok oyunculu oyun odaları: her (kafe, masa, oyun) için bir satır, durum JSON olarak tutulur.
  `CREATE TABLE IF NOT EXISTS game_rooms (
    id SERIAL PRIMARY KEY,
    biz_id INTEGER NOT NULL,
    tbl TEXT NOT NULL,
    game TEXT NOT NULL,
    state TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 0,
    updated_at BIGINT NOT NULL,
    UNIQUE (biz_id, tbl, game)
  )`,
  // Eski sürümden yükseltme: referans kodu artık düz metin tutulmaz, yalnızca özeti (ref_hash) saklanır.
  // Düz kodlar silinir; kullanılmamış kayıtlar için panelden "Yeni kod ver" denir.
  `CREATE TABLE IF NOT EXISTS game_votes (
    game TEXT PRIMARY KEY,
    votes INTEGER NOT NULL DEFAULT 0
  )`,
  `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ref_hash TEXT UNIQUE`,
  `ALTER TABLE businesses DROP COLUMN IF EXISTS ref_code`,
];

function ensure() {
  // Şema değiştiyse (ör. geliştirme sunucusu açıkken tablo eklendiyse) kurulum yeniden çalışır.
  const sig = SCHEMA.join(';');
  if (g.__neonSig !== sig) { g.__neonSig = sig; g.__neonReady = null; }
  g.__neonReady ??= (async () => {
    const c = client();
    for (const stmt of SCHEMA) await c.query(stmt);
  })().catch((err) => {
    g.__neonReady = null; // sonraki istekte yeniden dene
    throw err;
  });
  return g.__neonReady;
}

async function exec(text, params) {
  await ensure();
  return client().query(toPg(text), params);
}

export const get = async (text, ...params) => (await exec(text, params))[0];
export const all = (text, ...params) => exec(text, params);
export const run = async (text, ...params) => { await exec(text, params); };
