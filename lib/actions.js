'use server';
import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { get, run } from './db';
import {
  setSession, clearSession, getSession, hashPassword, checkPassword,
  safeEqual, tooMany, adminCreds,
} from './auth';
import { slugify, RESERVED_SLUGS } from './util';
import { TYPES, isType, parseInput } from './types';

const str = (fd, k) => String(fd.get(k) ?? '').trim();
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newRef = async () => {
  let ref;
  do {
    ref = Array.from(crypto.randomBytes(10), (b) => REF_ALPHABET[b % 32]).join('').replace(/(.{5})/, '$1-');
  } while (await get('SELECT 1 FROM businesses WHERE ref_code = ?', ref));
  return ref;
};

// ---------- admin ----------

export async function adminLogin(_prev, fd) {
  const lim = await tooMany('admin');
  if (lim.blocked) return { error: 'Çok fazla deneme. Biraz sonra tekrar deneyin.' };
  const { user, pass } = adminCreds();
  if (pass === null) return { error: 'Admin şifresi ayarlanmamış (ADMIN_PASSWORD).' };
  // İki alan da her zaman karşılaştırılır; hangisinin yanlış olduğu belli edilmez.
  const userOk = safeEqual(str(fd, 'username').toLowerCase(), user.toLowerCase());
  const passOk = safeEqual(String(fd.get('password') ?? ''), pass);
  if (!(userOk && passOk)) {
    lim.fail();
    return { error: 'Kullanıcı adı veya şifre hatalı.' };
  }
  await setSession('admin', 'admin');
  redirect('/admin');
}

export async function adminLogout() {
  await clearSession('admin');
  redirect('/admin');
}

async function requireAdmin() {
  if ((await getSession('admin')) !== 'admin') redirect('/admin');
}

export async function createBusiness(_prev, fd) {
  await requireAdmin();
  const name = str(fd, 'name').slice(0, 80);
  const slug = slugify(str(fd, 'slug') || name);
  if (!name) return { error: 'İşletme adı gerekli.' };
  if (!slug) return { error: 'Geçerli bir adres oluşturulamadı.' };
  if (RESERVED_SLUGS.has(slug)) return { error: `"${slug}" ayrılmış bir adres, başka bir ad deneyin.` };
  if (await get('SELECT 1 FROM businesses WHERE slug = ?', slug)) return { error: `"${slug}" adresi zaten kullanılıyor.` };
  const type = str(fd, 'type');
  if (!isType(type)) return { error: 'Kart türünü seçin.' };
  const ref = await newRef();
  await run('INSERT INTO businesses (slug, name, type, ref_code, created_at) VALUES (?, ?, ?, ?, ?)', slug, name, type, ref, Date.now());
  revalidatePath('/admin');
  return { ok: `Oluşturuldu: /${slug} (${TYPES[type].label}). Referans kodu: ${ref}` };
}

export async function deleteBusiness(fd) {
  await requireAdmin();
  await run('DELETE FROM businesses WHERE id = ?', Number(fd.get('id')));
  revalidatePath('/admin');
}

// Şifre unutulursa: yeni referans kodu verir ve hesabı sıfırlar; ad ve IBAN korunur.
export async function resetBusiness(fd) {
  await requireAdmin();
  await run(
    'UPDATE businesses SET ref_code = ?, email = NULL, pass_hash = NULL, pass_salt = NULL WHERE id = ?',
    await newRef(), Number(fd.get('id')),
  );
  revalidatePath('/admin');
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
  const biz = await get('SELECT * FROM businesses WHERE ref_code = ?', ref);
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
