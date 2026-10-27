# NFC Kart

IBAN, Google yorum, Instagram ve WhatsApp için NFC kart sistemi (Next.js).

## Çalıştırma

    npm install
    cp .env.example .env.local   # değerleri doldurun
    npm run dev                  # geliştirme
    npm run build && npm start   # canlı

Node 22.13 veya üstü gerekir. Veriler Neon (Postgres) veritabanında tutulur; `DATABASE_URL` zorunludur.
Eski SQLite kayıtlarını Neon'a taşımak için: `npm run db:import`.

## Nasıl çalışır

1. `/admin`: her satılan kart için işletme adı, adres ve kart türüyle kayıt açılır. Referans kodu çıkar.
2. Karta `https://alanadiniz.com/<adres>` linki yazılır (NFC Tools gibi bir uygulamayla).
3. İşletme `/kayit` sayfasında referans koduyla bir kez kaydolur, sonra `/giris` ile girer.
4. `/panel`: işletme adını ve kart bilgisini (IBAN, Google linki, Instagram, WhatsApp) günceller.
5. Kart okutulunca: IBAN kartı sayfayı gösterir; diğer türler doğrudan ilgili uygulamaya yönlendirir.

## Yöneticiler

Ana admin `ADMIN_USER` / `ADMIN_PASSWORD` ile girer ve silinemez. Ana admin, panelde "Yöneticiler"
bölümünden ek yönetici ekler, siler, şifrelerini sıfırlar. Ek yöneticiler kart oluşturup yönetebilir,
yönetici ekleyemez; kendi şifrelerini panelden değiştirebilir.

## Ortam değişkenleri

- `WHATSAPP_NUMBER`: sipariş butonlarının numarası (905xxxxxxxxx)
- `DATABASE_URL`: Neon bağlantı adresi
- `ADMIN_USER`: admin kullanıcı adı (varsayılan `admin`)
- `ADMIN_PASSWORD_HASH`: ana admin şifresinin özeti (önerilen). `.\scripts\hash-password.ps1` ile üretilir.
- `ADMIN_PASSWORD`: ana admin şifresi, düz metin (özet yoksa kullanılır; canlıda ikisinden biri zorunlu, geliştirmede varsayılan `admin123`)
- `SESSION_SECRET`: oturum imzası ve referans kodu özeti için anahtar (boşsa DATABASE_URL'den türetilir).
  **Canlıda sabit bir değer verin ve sonradan değiştirmeyin:** değişirse kullanılmamış referans kodları geçersiz olur.

## Yayına alma

Veritabanı Neon'da olduğu için Vercel dahil her ortamda çalışır. Ortam değişkenlerini (`DATABASE_URL`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`) yayın ortamına ekleyin.
