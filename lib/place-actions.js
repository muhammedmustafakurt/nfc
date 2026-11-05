'use server';
const reviewLink = (id) => `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;

// İşletme adını Google Places'te arar; her sonuç için Place ID ve yorum yazma linki döner.
export async function findPlaces(fd) {
  const q = String(fd.get('q') ?? '').trim();
  if (q.length < 3 || q.length > 150) return { error: 'İşletme adını ve şehri yazın (ör. Kahve Evi Kadıköy İstanbul).' };
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { error: 'Arama henüz ayarlanmamış (GOOGLE_MAPS_API_KEY eksik).' };

  let res;
  try {
    res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({ textQuery: q, languageCode: 'tr', regionCode: 'TR', pageSize: 5 }),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Google\'a ulaşılamadı, tekrar deneyin.' };
  }
  if (!res.ok) return { error: 'Google araması başarısız oldu. Anahtarı ve Places API (New) ayarını kontrol edin.' };
  const data = await res.json();
  const places = (data.places || []).map((p) => ({
    id: p.id,
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    link: reviewLink(p.id),
  }));
  if (!places.length) return { error: 'Sonuç bulunamadı. Adı şehirle birlikte yazmayı deneyin.' };
  return { places };
}
