import Link from 'next/link';
import { redirect } from 'next/navigation';
import Form from '@/components/Form';
import Mark from '@/components/Mark';
import { register } from '@/lib/actions';
import { currentBusinessId } from '@/lib/auth';

export const metadata = { title: 'Kayıt · NFC Kart' };

export default async function RegisterPage() {
  if (await currentBusinessId()) redirect('/panel');
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>Hesabınızı oluşturun</h1>
      <p className="lead">Kartınızla birlikte verilen referans kodunu girin. Sonraki girişlerde e-posta ve şifrenizi kullanırsınız.</p>
      <Form action={register} submit="Kayıt ol">
        <label>Referans kodu <input name="ref" required autoCapitalize="characters" autoComplete="off" placeholder="XXXXX-XXXXX" /></label>
        <label>E-posta <input name="email" type="email" autoComplete="email" required /></label>
        <label>Şifre (en az 8 karakter) <input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      </Form>
      <p className="alt">Zaten hesabınız var mı? <Link href="/giris">Giriş yapın.</Link></p>
    </main>
  );
}
