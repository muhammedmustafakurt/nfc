'use client';
import { useRef, useState } from 'react';
import Form from './Form';
import { setCafeLocation } from '@/lib/actions';

// Kafenin konumunu girer: "Şu anki konumumu kullan" düğmesi admin kafedeyken konumu doldurur.
export default function CafeLocation({ id, lat, lng }) {
  const la = useRef(null);
  const ln = useRef(null);
  const [msg, setMsg] = useState('');

  function here() {
    setMsg('');
    if (!navigator.geolocation) { setMsg('Bu tarayıcı konum vermiyor.'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { la.current.value = p.coords.latitude.toFixed(6); ln.current.value = p.coords.longitude.toFixed(6); },
      () => setMsg('Konum alınamadı, izin verin ya da elle girin.'),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <Form action={setCafeLocation} submit="Konumu kaydet">
      <input type="hidden" name="id" value={id} />
      <div className="row">
        <label>Enlem <input ref={la} name="lat" defaultValue={lat ?? ''} inputMode="decimal" placeholder="41.0082" /></label>
        <label>Boylam <input ref={ln} name="lng" defaultValue={lng ?? ''} inputMode="decimal" placeholder="28.9784" /></label>
      </div>
      <button type="button" className="btn sm" onClick={here}>Şu anki konumumu kullan</button>
      {msg && <p className="msg err" role="status">{msg}</p>}
    </Form>
  );
}
