import Link from 'next/link';
import Mark from '@/components/Mark';
import PhoneDemo from '@/components/PhoneDemo';
import OrderButton from '@/components/OrderButton';
import './landing.css';

export const metadata = {
  title: 'NFC Kart · Telefonu yaklaştır, IBAN, yorum ve Instagram açılsın',
  description: 'IBAN, Google yorum ve Instagram için NFC kartlar. Uygulama ve pil gerekmez; bilgiyi istediğiniz an kendiniz değiştirin.',
  robots: { index: true, follow: true },
};

const CARDS = [
  { id: 'iban', name: 'IBAN kartı', text: 'Müşteri kartı okutur, IBAN\'ınız ekranda açılır, tek dokunuşla kopyalar. Banka bilgisi dikte etmek yok.', msg: 'Merhaba, IBAN kartı sipariş etmek istiyorum.' },
  { id: 'google', name: 'Google yorum kartı', text: 'Kart doğrudan Google yorum yazma ekranını açar. Memnun müşteri kasadan ayrılmadan yorumunu bırakır.', msg: 'Merhaba, Google yorum kartı sipariş etmek istiyorum.' },
  { id: 'instagram', name: 'Instagram kartı', text: 'Telefonu yaklaştıran kişi doğrudan Instagram profilinize düşer ve takip eder.', msg: 'Merhaba, Instagram kartı sipariş etmek istiyorum.' },
];

const STEPS = [
  { t: 'Kartı sipariş edin', d: 'Hangi kartı istediğinizi WhatsApp\'tan yazın.' },
  { t: 'Referans kodunuzla kaydolun', d: 'Size verilen kodla hesabınızı açın, IBAN ya da linkinizi girin.' },
  { t: 'Kartı okutun', d: 'Müşteri telefonunu yaklaştırır, bilgiler kendiliğinden açılır.' },
];

const WHY = [
  { t: 'Uygulama gerekmez', d: 'Müşteri hiçbir şey indirmez. Telefonu karta yaklaştırması yeter.' },
  { t: 'Pil ve şarj yok', d: 'Kart telefonun enerjisiyle çalışır, bitmez, bozulacak parçası yoktur.' },
  { t: 'Bilgiyi istediğiniz an değiştirin', d: 'IBAN\'ınız ya da linkiniz değişirse panelden güncelleyin. Kartı yeniden yazdırmazsınız.' },
  { t: 'Kaç kişi okuttu, görün', d: 'Panelde kartınızın kaç kez okutulduğunu takip edersiniz.' },
];

const FAQ = [
  { q: 'NFC nedir, nasıl çalışır?', a: 'NFC, telefonun kısa mesafeden bir etiketi okumasını sağlayan teknolojidir. Kartın içindeki etiket bir link taşır; telefon yaklaşınca o linki açar.' },
  { q: 'Hangi telefonlar kartı okur?', a: 'Son yıllarda çıkan çoğu iPhone ve Android telefon NFC okur. Telefonun ekranı açıkken kartı arka yüze yaklaştırmak yeterlidir.' },
  { q: 'IBAN\'ımı değiştirirsem yeni kart gerekir mi?', a: 'Hayır. Karttaki link hiç değişmez. Panelden yeni IBAN\'ı girdiğiniz anda kartı okutan herkes yenisini görür.' },
  { q: 'IBAN kartında bilgilerimi herkes görebilir mi?', a: 'Kartı okutan ya da linki bilen kişi, işletme adınızı ve IBAN\'ınızı görür; başka hiçbir bilgiyi görmez. Zaten müşteriye vereceğiniz bilgidir.' },
  { q: 'Hesabımı nasıl açarım?', a: 'Kartınızla birlikte size bir referans kodu verilir. Kayıt sayfasında bu kodla e-posta ve şifre belirlersiniz, sonrasında e-posta ve şifrenizle giriş yaparsınız.' },
];

const ArcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 8.5a5.5 5.5 0 0 1 0 7" /><path d="M9.5 5.5a10 10 0 0 1 0 13" /><path d="M14 2.5a14.5 14.5 0 0 1 0 19" />
  </svg>
);

export default function Home() {
  return (
    <>
      <section className="lp-hero">
        <div className="lp-wrap">
          <nav className="lp-nav" aria-label="Ana menü">
            <Mark />
            <Link href="/giris" className="lp-nav-link">İşletme girişi</Link>
          </nav>
          <div className="lp-hero-grid">
            <div>
              <h1>Telefonu karta yaklaştır, gerisi kendiliğinden açılsın.</h1>
              <p className="lp-sub">IBAN, Google yorumu ve Instagram için NFC kartlar. Uygulama yok, pil yok, kasada bekleme yok.</p>
              <div className="lp-cta">
                <OrderButton />
                <a className="lp-btn ghost" href="#kartlar">Kartları incele</a>
              </div>
            </div>
            <PhoneDemo />
          </div>
        </div>
      </section>

      <section className="lp-section" id="kartlar">
        <div className="lp-wrap">
          <h2>Üç kart, üç iş</h2>
          <ul className="lp-cards">
            {CARDS.map((c) => (
              <li key={c.id} className={`lp-card-row c-${c.id}`}>
                <div className="lp-chip" aria-hidden="true"><ArcIcon /></div>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.text}</p>
                </div>
                <OrderButton text={c.msg} className="lp-btn sm" >Sipariş ver</OrderButton>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-section alt" id="nasil">
        <div className="lp-wrap">
          <h2>Nasıl çalışır?</h2>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <span className="n" aria-hidden="true">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-wrap">
          <h2>Neden NFC kart?</h2>
          <dl className="lp-why">
            {WHY.map((w) => (
              <div key={w.t}>
                <dt>{w.t}</dt>
                <dd>{w.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="lp-section alt" id="sss">
        <div className="lp-wrap narrow">
          <h2>Sık sorulanlar</h2>
          <div className="lp-faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-band">
        <div className="lp-wrap lp-band-in">
          <h2>Kartınızı bugün sipariş edin.</h2>
          <OrderButton className="lp-btn light" />
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <Mark />
          <Link href="/giris">İşletme girişi</Link>
        </div>
      </footer>
    </>
  );
}
