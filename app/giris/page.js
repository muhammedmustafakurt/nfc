import Link from 'next/link';
import { redirect } from 'next/navigation';
import Form from '@/components/Form';
import Mark from '@/components/Mark';
import { login } from '@/lib/actions';
import { currentBusinessId } from '@/lib/auth';

export const metadata = { title: 'Giriş · NFC Kart' };

export default async function LoginPage() {
  if (await currentBusinessId()) redirect('/panel');
  return (
    <main className="shell">
      <header><Mark /></header>
      <h1>İşletme girişi</h1>
      <p className="lead">IBAN bilgilerinizi güncellemek için giriş yapın.</p>
      <Form action={login} submit="Giriş yap">
        <label>E-posta <input name="email" type="email" autoComplete="email" required /></label>
        <label>Şifre <input name="password" type="password" autoComplete="current-password" required /></label>
      </Form>
      <p className="alt">İlk kez mi giriyorsunuz? <Link href="/kayit">Referans kodunuzla kayıt olun.</Link></p>
    </main>
  );
}
