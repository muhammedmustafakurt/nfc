'use client';
import { PALETTE } from '@/lib/emlak';

// Masa lobisi: oyuncu listesi, katılma, başlatma ve ayrılma. Emlak Krallığı ve Satranç ortak kullanır.
// seatNote(k): koltuğun yanında görünen not (ör. satrançta "Beyaz").
export default function Lobby({ masaNo, room, ui, max, min, seatNote }) {
  const { name, setName, busy, err, join, send } = ui;
  const seated = room.me >= 0;
  const full = room.seats.length >= max;
  return (
    <div className="mono-lobby">
      <h2>Masa {masaNo}: oyuncular</h2>
      {room.seats.length === 0 ? <p className="muted">Henüz kimse katılmadı.</p> : (
        <ul className="mono-seats">
          {room.seats.map((s, k) => (
            <li key={k}>
              <i className="av" style={{ background: PALETTE[k % PALETTE.length] }}>{k + 1}</i>
              <span>{s.name}{k === room.me ? ' (sen)' : ''}</span>
              <span className="host">{seatNote(k)}</span>
            </li>
          ))}
        </ul>
      )}
      {!seated ? (
        <div className="mono-join">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" maxLength={16} autoComplete="nickname" />
          <button className="btn primary" disabled={busy || full} onClick={join}>{full ? 'Masa dolu' : 'Masaya katıl'}</button>
        </div>
      ) : (
        <>
          {room.me === 0 ? (
            <button className="btn primary" disabled={busy || room.seats.length < min} onClick={() => send('start')}>
              {room.seats.length < min ? `En az ${min} kişi gerekli` : 'Oyunu başlat'}
            </button>
          ) : (
            <p className="muted">Masayı açan kişinin oyunu başlatması bekleniyor…</p>
          )}
          <button className="btn sm" disabled={busy} onClick={() => send('leave')}>Masadan ayrıl</button>
        </>
      )}
      <p className="mono-where">Aynı masadaki arkadaşlarınız bu sayfayı kendi telefonlarında açıp katılabilir. En fazla {max} kişi.</p>
      {err && <p className="mono-err" role="alert">{err}</p>}
    </div>
  );
}
