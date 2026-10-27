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

// Tablo, her sunucu örneğinde ilk sorguda bir kez oluşturulur.
function ensure() {
  g.__neonReady ??= client()
    .query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'iban',
        value TEXT,
        extra TEXT,
        taps INTEGER NOT NULL DEFAULT 0,
        ref_code TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        pass_hash TEXT,
        pass_salt TEXT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT
      )
    `)
    .catch((err) => {
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
