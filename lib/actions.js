'use server';
import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { get, run } from './db';
import {
  setSession, clearSession, getSession, hashPassword, checkPassword,
  safeEqual, tooMany, adminCreds, getAdmin, hashRef,
} from './auth';
import { slugify, RESERVED_SLUGS } from './util';
import { TYPES, isType, parseInput } from './types';

const str = (fd, k) => String(fd.get(k) ?? '').trim();
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// Yeni referans kodu üretir; düz hâli yalnızca bu dönüşte vardır, veritabanına özeti yazılır.
const newRef = async () => {
  let code, hash;
  do {
    code = Array.from(crypto.randomBytes(10), (b) => REF_ALPHABET[b % 32]).join('').replace(/(.{5})/, '$1-');
    hash = hashRef(code);
  } while (await get('SELECT 1 FROM businesses WHERE ref_hash = ?', hash));
  return { code, hash };
};

// ---------- admin ----------

// Var olmayan kullanıcıda da şifre özeti hesaplanır; böylece yanıt süresinden kullanıcı adı anlaşılmaz.
const DUMMY = hashPassword('kullanici-yok');

export async function adminLogin(_prev, fd) {
  const lim = await tooMany('admin');
  if (lim.blocked) return { error: 'Çok fazla deneme. Biraz sonra tekrar deneyin.' };
  const { user, configured, check } = adminCreds();
  if (!configured) return { error: 'Admin şifresi ayarlanmamış (ADMIN_PASSWORD_HASH ya da ADMIN_PASSWORD).' };

  const username = str(fd, 'username').toLowerCase();
  const password = String(fd.get('password') ?? '');

  // 1) Ana admin (ortam değişkenleri). İki alan da her zaman karşılaştırılır.
  const userOk = safeEqual(username, user.toLowerCase());
  const passOk = check(password);
  if (userOk && passOk) {
    await setSession('admin', 'main');
    redirect('/admin');
  }

  // 2) Panelden eklenmiş yönetici. Veritabanına ulaşılamazsa yalnızca ana admin girebilir.
  let row = null;
  try {
    row = await get('SELECT id, pass_hash, pass_salt FROM admins WHERE username = ?', username);
  } catch {
    row = null;
  }
  const ok = row
    ? checkPassword(password, row.pass_salt, row.pass_hash)
    : (checkPassword(password, DUMMY.salt, DUMMY.hash), false);
  if (!ok) {
    lim.fail();
    return { error: 'Kullanıcı adı veya şifre hatalı.' };
  }
  await setSession('admin', `a:${row.id}`);
  redirect('/admin');
}

export async function adminLogout() {
  await clearSession('admin');
  redirect('/admin');
}

async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin');
  return admin;
}

// Yönetici ekleme, silme ve şifre sıfırlama yalnızca ana admine açık.
async function requireMain() {
  const admin = await requireAdmin();
  if (!admin.main) redirect('/admin');
  return admin;
}

export async function createBusiness(_prev, fd) {
  await requireAdmin();
  const name = str(fd, 'name').slice(0, 80);
  const slug = slugify(str(fd, 'slug') || name);
  if (!name) return { error: 'İşletme adı gerekli.' };
  if (!slug) return { error: 'Geçerli bir adres oluşturulamadı.' };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" ayrılmış bir adres, başka bir ad deneyin.` };
  if (await get('SELECT 1 FROM businesses WHERE slug = ?', slug) || await get('SELECT 1 FROM cafes WHERE slug = ?', slug)) {
    return { error: `"${slug}" adresi zaten kullanılıyor.` };
  }
  const type = str(fd, 'type');
  if (!isType(type)) return { error: 'Kart türünü seçin.' };
  const ref = await newRef();
  await run('INSERT INTO businesses (slug, name, type, ref_hash, created_at) VALUES (?, ?, ?, ?, ?)', slug, name, type, ref.hash, Date.now());
  revalidatePath('/admin');
  return { ok: `Oluşturuldu: /${slug} (${TYPES[type].label}). Referans kodu yalnızca şimdi görünür, kopyalayın:`, code: ref.code };
}

export async function deleteBusiness(fd) {
  await requireAdmin();
  await run('DELETE FROM businesses WHERE id = ?', Number(fd.get('id')));
  revalidatePath('/admin');
}

// Yeni referans kodu verir ve hesabı sıfırlar (şifre unutulduysa ya da kod kaybolduysa);
// ad ve IBAN korunur. Kod yalnızca bu yanıtta görünür.
export async function resetBusiness(_prev, fd) {
  await requireAdmin();
  const ref = await newRef();
  await run(
    'UPDATE businesses SET ref_hash = ?, email = NULL, pass_hash = NULL, pass_salt = NULL WHERE id = ?',
    ref.hash, Number(fd.get('id')),
  );
  revalidatePath('/admin');
  return { ok: 'Yeni referans kodu yalnızca şimdi görünür, kopyalayın:', code: ref.code };
}

// ---------- kafeler (masa oyunları; NFC kartlardan ayrı) ----------

export async function createCafe(_prev, fd) {
  await requireAdmin();
  const name = str(fd, 'name').slice(0, 80);
  const slug = slugify(str(fd, 'slug') || name);
  if (!name) return { error: 'Kafe adı gerekli.' };
  if (!slug) return { error: 'Geçerli bir adres oluşturulamadı.' };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" ayrılmış bir adres, başka bir ad deneyin.` };
  if (await get('SELECT 1 FROM cafes WHERE slug = ?', slug) || await get('SELECT 1 FROM businesses WHERE slug = ?', slug)) {
    return { error: `"${slug}" adresi zaten kullanılıyor.` };
  }
  await run('INSERT INTO cafes (slug, name, created_at) VALUES (?, ?, ?)', slug, name, Date.now());
  revalidatePath('/admin/kafeler');
  return { ok: `Kafe eklendi. Masa adresleri: /${slug}/masa-1/oyunlar, /${slug}/masa-2/oyunlar …` };
}

// Kafenin konumunu kaydeder (boş bırakılırsa konum kontrolü kapanır).
export async function setCafeLocation(_prev, fd) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const rawLat = str(fd, 'lat').replace(',', '.');
  const rawLng = str(fd, 'lng').replace(',', '.');
  if (!rawLat && !rawLng) {
    await run('UPDATE cafes SET lat = NULL, lng = NULL WHERE id = ?', id);
    revalidatePath('/admin/kafeler');
    return { ok: 'Konum kontrolü kapatıldı.' };
  }
  const lat = Number(rawLat), lng = Number(rawLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { error: 'Geçerli bir enlem ve boylam girin.' };
  await run('UPDATE cafes SET lat = ?, lng = ? WHERE id = ?', lat, lng, id);
  revalidatePath('/admin/kafeler');
  return { ok: 'Konum kaydedildi ✓' };
}

// Kafeyi ve masalarındaki oyun odalarını siler.
export async function deleteCafe(fd) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  await run('DELETE FROM game_rooms WHERE biz_id = ?', id);
  await run('DELETE FROM cafes WHERE id = ?', id);
  revalidatePath('/admin/kafeler');
}

// ---------- yöneticiler ----------

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const USERNAME_HINT = 'Kullanıcı adı 3-32 karakter olmalı; harf, rakam, nokta, tire ve alt çizgi kullanılabilir.';

export async function createAdmin(_prev, fd) {
  await requireMain();
  const username = str(fd, 'username').toLowerCase();
  const pw = String(fd.get('password') ?? '');
  if (!USERNAME_RE.test(username)) return { error: USERNAME_HINT };
  if (pw.length < 8) return { error: 'Şifre en az 8 karakter olmalı.' };
  if (username === adminCreds().user.toLowerCase()) return { error: 'Bu kullanıcı adı ana admine ait.' };
  if (await get('SELECT 1 FROM admins WHERE username = ?', username)) return { error: 'Bu kullanıcı adı zaten var.' };
  const { salt, hash } = hashPassword(pw);
  await run('INSERT INTO admins (username, pass_hash, pass_salt, created_at) VALUES (?, ?, ?, ?)', username, hash, salt, Date.now());
  revalidatePath('/admin');
  return { ok: `"${username}" yöneticisi eklendi.` };
}

export async function deleteAdmin(fd) {
  await requireMain();
  await run('DELETE FROM admins WHERE id = ?', Number(fd.get('id')));
  revalidatePath('/admin');
}

export async function resetAdminPassword(_prev, fd) {
  await requireMain();
  const id = Number(fd.get('id'));
  const pw = String(fd.get('password') ?? '');
  if (!id) return { error: 'Yönetici seçin.' };
  if (pw.length < 8) return { error: 'Şifre en az 8 karakter olmalı.' };
  const row = await get('SELECT username FROM admins WHERE id = ?', id);
  if (!row) return { error: 'Yönetici bulunamadı.' };
  const { salt, hash } = hashPassword(pw);
  await run('UPDATE admins SET pass_hash = ?, pass_salt = ? WHERE id = ?', hash, salt, id);
  return { ok: `"${row.username}" için yeni şifre kaydedildi.` };
}

// Eklenmiş yönetici kendi şifresini değiştirir. Ana adminin şifresi ADMIN_PASSWORD ile yönetilir.
export async function changeOwnPassword(_prev, fd) {
  const admin = await requireAdmin();
  if (admin.main) return { error: 'Ana admin şifresi ADMIN_PASSWORD_HASH (ya da ADMIN_PASSWORD) ortam değişkeniyle değiştirilir.' };
  const lim = await tooMany('admin-pw');
  if (lim.blocked) return { error: 'Çok fazla deneme. Biraz sonra tekrar deneyin.' };
  const pw = String(fd.get('password') ?? '');
  if (pw.length < 8) return { error: 'Yeni şifre en az 8 karakter olmalı.' };
  const row = await get('SELECT pass_hash, pass_salt FROM admins WHERE id = ?', admin.id);
  if (!row || !checkPassword(fd.get('current'), row.pass_salt, row.pass_hash)) {
    lim.fail();
    return { error: 'Mevcut şifre hatalı.' };
  }
  const { salt, hash } = hashPassword(pw);
  await run('UPDATE admins SET pass_hash = ?, pass_salt = ? WHERE id = ?', hash, salt, admin.id);
  return { ok: 'Şifreniz değiştirildi ✓' };
}

// ---------- işletme sahibi ----------

export async function register(_prev, fd) {
  const lim = await tooMany('register');
  if (lim.blocked) return { error: 'Çok fazla deneme. Biraz sonra tekrar deneyin.' };
  let ref = str(fd, 'ref').toUpperCase().replace(/[\s-]/g, '');
  ref = ref.replace(/(.{5})/, '$1-');
  const email = str(fd, 'email').toLowerCase();
  const pw = String(fd.get('password') ?? '');
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Geçerli bir e-posta girin.' };
  if (pw.length < 8) return { error: 'Şifre en az 8 karakter olmalı.' };
  const biz = await get('SELECT * FROM businesses WHERE ref_hash = ?', hashRef(ref));
  if (!biz || biz.email) {
    lim.fail();
    return { error: 'Referans kodu geçersiz veya daha önce kullanılmış.' };
  }
  if (await get('SELECT 1 FROM businesses WHERE email = ?', email)) return { error: 'Bu e-posta zaten kayıtlı.' };
  const { salt, hash } = hashPassword(pw);
  await run('UPDATE businesses SET email = ?, pass_hash = ?, pass_salt = ? WHERE id = ?', email, hash, salt, biz.id);
  await setSession('biz', String(biz.id));
  redirect('/panel');
}

export async function login(_prev, fd) {
  const lim = await tooMany('login');
  if (lim.blocked) return { error: 'Çok fazla deneme. Biraz sonra tekrar deneyin.' };
  const biz = await get('SELECT * FROM businesses WHERE email = ?', str(fd, 'email').toLowerCase());
  if (!biz || !checkPassword(fd.get('password'), biz.pass_salt, biz.pass_hash)) {
    lim.fail();
    return { error: 'E-posta veya şifre hatalı.' };
  }
  await setSession('biz', String(biz.id));
  redirect('/panel');
}

export async function logout() {
  await clearSession('biz');
  redirect('/giris');
}

export async function saveProfile(_prev, fd) {
  const id = await getSession('biz');
  if (!id) redirect('/giris');
  const biz = await get('SELECT slug, type FROM businesses WHERE id = ?', Number(id));
  if (!biz) redirect('/giris');
  const name = str(fd, 'name').slice(0, 80);
  if (!name) return { error: 'İşletme adı gerekli.' };
  const parsed = parseInput(biz.type, fd.get('value'));
  if (parsed.error) return { error: parsed.error };
  await run('UPDATE businesses SET name = ?, value = ?, extra = ?, updated_at = ? WHERE id = ?', name, parsed.value, parsed.extra, Date.now(), Number(id));
  revalidatePath(`/${biz.slug}`);
  return { ok: 'Kaydedildi ✓' };
}
