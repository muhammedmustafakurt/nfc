// Yerel SQLite kayıtlarını (data/nfckart.db) Neon'a taşır. Kayıt kimlikleri korunur,
// aynı adresli kayıt Neon'da varsa atlanır; tekrar çalıştırmak güvenlidir.
//   npm run db:import
import { DatabaseSync } from 'node:sqlite';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import crypto from 'node:crypto';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL ayarlanmamış. .env.local dosyasına Neon bağlantı adresini ekleyin.');
  process.exit(1);
}
if (!fs.existsSync('data/nfckart.db')) {
  console.error('data/nfckart.db bulunamadı, taşınacak kayıt yok.');
  process.exit(0);
}

// lib/auth.js'deki hashRef ile aynı algoritma: anahtar SESSION_SECRET ya da DATABASE_URL'den türetilir.
const key = process.env.SESSION_SECRET || crypto.createHash('sha256').update(`nfckart-session:${url}`).digest('hex');
const hashRef = (code) => crypto.createHmac('sha256', key).update(`ref:${code}`).digest('hex');

const sql = neon(url);
await sql.query(`
  CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'iban', value TEXT, extra TEXT,
    taps INTEGER NOT NULL DEFAULT 0, ref_hash TEXT UNIQUE, email TEXT UNIQUE,
    pass_hash TEXT, pass_salt TEXT, created_at BIGINT NOT NULL, updated_at BIGINT
  )`);

const rows = new DatabaseSync('data/nfckart.db').prepare('SELECT * FROM businesses ORDER BY id').all();
let added = 0;
for (const r of rows) {
  const res = await sql.query(
    `INSERT INTO businesses (id, slug, name, type, value, extra, taps, ref_hash, email, pass_hash, pass_salt, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING RETURNING id`,
    [r.id, r.slug, r.name, r.type ?? 'iban', r.value ?? r.iban ?? null, r.extra ?? null, r.taps ?? 0, r.ref_code ? hashRef(r.ref_code) : null,
     r.email, r.pass_hash, r.pass_salt, r.created_at, r.updated_at],
  );
  added += res.length;
}
await sql.query(`SELECT setval(pg_get_serial_sequence('businesses','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM businesses), 1))`);
console.log(`${rows.length} kayıttan ${added} tanesi Neon'a taşındı, ${rows.length - added} tanesi zaten vardı.`);
