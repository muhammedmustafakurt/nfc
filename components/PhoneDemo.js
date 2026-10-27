'use client';
import { useState } from 'react';

const TABS = [
  { id: 'iban', label: 'IBAN' },
  { id: 'google', label: 'Google yorum' },
  { id: 'instagram', label: 'Instagram' },
];

// Her kart türünün plakası: üst bantta büyük başlık, altında yönlendirme yazısı.
const PLAQUES = {
  iban: { badge: '₺', title: 'IBAN', sub: 'BANKA HESAP BİLGİLERİ', text: ['ÖDEME BİLGİLERİ İÇİN', 'TELEFONUNUZU BURAYA YAKLAŞTIRIN'], thanks: 'Teşekkür ederiz!' },
  google: { badge: '★', title: 'YORUM', sub: "GOOGLE'DA DEĞERLENDİRİN", text: ['YORUM YAZMAK İÇİN', 'TELEFONUNUZU BURAYA YAKLAŞTIRIN'], thanks: 'Görüşünüz değerli!' },
  instagram: { badge: '@', title: 'INSTAGRAM', sub: 'BİZİ TAKİP EDİN', text: ['PROFİLİMİZİ AÇMAK İÇİN', 'TELEFONUNUZU BURAYA YAKLAŞTIRIN'], thanks: 'Teşekkür ederiz!' },
};

const CopyGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);

function Screen({ id }) {
  if (id === 'iban') {
    return (
      // Gerçek kart sayfasının (app/[slug]/page.js) küçültülmüş hâli
      <div className="ph-screen ph-iban">
        <div className="mk">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 8.5a5.5 5.5 0 0 1 0 7" /><path d="M9.5 5.5a10 10 0 0 1 0 13" /><path d="M14 2.5a14.5 14.5 0 0 1 0 19" />
          </svg>
          NFC Kart
        </div>
        <span className="sample">Örnek çalışma</span>
        <div className="mid">
          <p className="cap">Ad Soyad</p>
          <div className="fl">
            <strong className="long">Teknoloji ve Bilişim Hizmetleri Anonim Şirketi</strong>
            <b className="cb"><CopyGlyph />Kopyala</b>
          </div>
          <p className="sub">Havale / EFT için IBAN</p>
          <div className="fl">
            <ul>{['TR37', '0004', '6012', '2588', '8000', '0809', '11'].map((g) => <li key={g}>{g}</li>)}</ul>
            <b className="cb"><CopyGlyph />Kopyala</b>
          </div>
        </div>
        <p className="ft">Siz de NFC Kart isterseniz <u>iletişime geçin</u></p>
      </div>
    );
  }
  if (id === 'google') {
    return (
      <div className="ph-screen ph-google">
        <strong className="long">Teknoloji ve Bilişim Hizmetleri Anonim Şirketi</strong>
        <span>Deneyiminizi puanlayın</span>
        <div className="stars" aria-hidden="true">{'★★★★★'}</div>
        <i>Yorum yaz</i>
      </div>
    );
  }
  if (id === 'instagram') {
    return (
      <div className="ph-screen ph-insta">
        <div className="av" aria-hidden="true" />
        <strong>@teknoloji</strong>
        <i>Takip et</i>
        <div className="grid" aria-hidden="true">{Array.from({ length: 6 }, (_, n) => <b key={n} />)}</div>
      </div>
    );
  }
}

// Kartın okutulunca ne açtığını gösteren etkileşimli telefon önizlemesi.
export default function PhoneDemo() {
  const [tab, setTab] = useState('iban');
  const pl = PLAQUES[tab];
  return (
    <div className="ph-wrap">
      {/* key: sekme değişince animasyon baştan oynar */}
      <div className="ph-scene" key={tab}>
        <div className="plaque" aria-hidden="true">
          <div className="plaque-in">
            <div className="plaque-top">
              <span className="plaque-try">{pl.badge}</span>
              <b className={pl.title.length > 6 ? 'small' : undefined}>{pl.title}</b>
              <span>{pl.sub}</span>
            </div>
            <div className="plaque-body">
              <svg viewBox="0 0 84 66" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="34" y="4" width="30" height="58" rx="7" />
                <path d="M44 9h10" /><path d="M45 56h8" />
                <path d="M26 24a14 14 0 0 0 0 18" /><path d="M18 18a24 24 0 0 0 0 30" /><path d="M10 12a34 34 0 0 0 0 42" />
                <text x="49" y="37" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" stroke="none">NFC</text>
              </svg>
              <p>{pl.text[0]}<br />{pl.text[1]}</p>
              <em>{pl.thanks}</em>
            </div>
          </div>
        </div>
        <div className="nfc-waves" aria-hidden="true">
          <i style={{ '--k': 0 }} /><i style={{ '--k': 1 }} /><i style={{ '--k': 2 }} />
        </div>
        <div className="ph-pos">
          <div className="ph" aria-live="polite">
            <div className="ph-notch" aria-hidden="true" />
            <Screen id={tab} />
          </div>
        </div>
      </div>
      <p className="ph-note">Örnek gösterimdir.</p>
      <div className="ph-tabs" role="tablist" aria-label="Kart türü">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className="ph-tab" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
