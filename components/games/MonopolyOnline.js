'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from './Monopoly';
import { COLORS } from '@/lib/emlak';

const POLL_MS = 1500;
let memPid = null; // localStorage kapalıysa en azından sayfa açıkken aynı kimlik kullanılsın

// Bu telefonu tanıyan gizli kimlik; başka telefonlara gönderilmez.
function getPid() {
  const ok = (p) => typeof p === 'string' && /^[a-zA-Z0-9]{16,64}$/.test(p);
  try {
    let p = localStorage.getItem('nfc-pid');
    if (!ok(p)) { p = crypto.randomUUID().replace(/-/g, ''); localStorage.setItem('nfc-pid', p); }
    return p;
  } catch {
    return (memPid ??= crypto.randomUUID().replace(/-/g, ''));
  }
}

export default function MonopolyOnline({ cafe, masa }) {
  const [pid, setPid] = useState(null);
  const [room, setRoom] = useState(null);
  const [err, setErr] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const ver = useRef(-1);
  const masaNo = masa.replace('masa-', '');

  useEffect(() => {
    setPid(getPid());
    try { setName(localStorage.getItem('nfc-name') || ''); } catch {}
  }, []);

  // Sürüm değiştiyse yeni durumu al; telefon arka plandayken yoklamayı atla.
  useEffect(() => {
    if (!pid) return;
    let dead = false;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(`/api/room?cafe=${cafe}&masa=${masa}&game=monopoly&pid=${pid}&v=${ver.current}`, { cache: 'no-store' });
        const d = await r.json();
        if (dead) return;
        if (!r.ok) { setErr(d.error || 'Masa açılamadı.'); return; }
        setErr('');
        if (!d.unchanged) { ver.current = d.version; setRoom(d); }
      } catch {
        if (!dead) setErr('Bağlantı koptu, yeniden deneniyor…');
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { dead = true; clearInterval(id); };
  }, [pid, cafe, masa]);

  const send = useCallback(async (type, extra = {}) => {
    if (!pid || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafe, masa, game: 'monopoly', pid, action: { type, ...extra } }),
      });
      const d = await r.json();
      setErr(d.error && !d.seats ? d.error : '');
      if (d.seats) { ver.current = d.version; setRoom(d); if (d.error) setErr(d.error); }
    } catch {
      setErr('Bağlantı koptu, tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  }, [pid, busy, cafe, masa]);

  const join = () => {
    const n = name.trim();
    try { localStorage.setItem('nfc-name', n); } catch {}
    send('join', { name: n });
  };

  if (!room) return <p className="mono-where">{err || 'Masa açılıyor…'}</p>;

  const seated = room.me >= 0;
  const g = room.game;

  if (room.phase === 'lobby') {
    return (
      <div className="mono-lobby">
        <h2>Masa {masaNo}: oyuncular</h2>
        {room.seats.length === 0 ? <p className="muted">Henüz kimse katılmadı.</p> : (
          <ul className="mono-seats">
            {room.seats.map((s, k) => (
              <li key={k}>
                <i className="av" style={{ background: COLORS[k] }}>{k + 1}</i>
                <span>{s.name}{k === room.me ? ' (sen)' : ''}</span>
                {k === 0 && <span className="host">masayı açan</span>}
              </li>
            ))}
          </ul>
        )}
        {!seated ? (
          <div className="mono-join">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" maxLength={16} autoComplete="nickname" />
            <button className="btn primary" disabled={busy || room.seats.length >= 4} onClick={join}>
              {room.seats.length >= 4 ? 'Masa dolu' : 'Masaya katıl'}
            </button>
          </div>
        ) : (
          <>
            {room.me === 0 ? (
              <button className="btn primary" disabled={busy || room.seats.length < 2} onClick={() => send('start')}>
                {room.seats.length < 2 ? 'En az 2 kişi gerekli' : 'Oyunu başlat'}
              </button>
            ) : (
              <p className="muted">Masayı açan kişinin oyunu başlatması bekleniyor…</p>
            )}
            <button className="btn sm" disabled={busy} onClick={() => send('leave')}>Masadan ayrıl</button>
          </>
        )}
        <p className="mono-where">Aynı masadaki arkadaşlarınız bu sayfayı kendi telefonlarında açıp katılabilir. En fazla 4 kişi.</p>
        {err && <p className="mono-err" role="alert">{err}</p>}
      </div>
    );
  }

  const myTurn = seated && g.turn === room.me && (g.phase === 'roll' || g.phase === 'buy');
  return (
    <>
      {!seated && <p className="mono-where">Oyun başladı; izleyici olarak takip ediyorsunuz.</p>}
      <Board
        g={g}
        meIdx={seated ? room.me : -1}
        canAct={myTurn}
        onRoll={() => send('roll')}
        onBuy={() => send('buy')}
        onSkip={() => send('skip')}
        onNew={() => (seated ? send('reset') : null)}
        newLabel={seated ? 'Yeni oyun (lobiye dön)' : 'Oyun bitti'}
      />
      {err && <p className="mono-err" role="alert">{err}</p>}
      {seated && g.phase !== 'over' && !g.players[room.me].out && (
        sure
          ? <button className="btn sm danger" disabled={busy} onClick={() => { setSure(false); send('leave'); }}>Evet, masadan ayrıl (oyundan çıkarım)</button>
          : <button className="btn sm" onClick={() => setSure(true)}>Masadan ayrıl</button>
      )}
    </>
  );
}
