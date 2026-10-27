'use client';
import { useEffect, useRef, useState } from 'react';
import Lobby from './Lobby';
import useRoom from './useRoom';
import { LOCATIONS } from '@/lib/spyfall';

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Masada casus oyunu: herkes kendi telefonunda gizli kartını görür.
export default function SpyfallOnline({ cafe, masa }) {
  const ui = useRoom({ cafe, masa, game: 'spyfall' });
  const { room, err, busy, send } = ui;
  const [show, setShow] = useState(false); // kart yanındakinin görmemesi için varsayılan gizli
  const [struck, setStruck] = useState(() => new Set()); // listeden elediğim mekânlar
  const [pick, setPick] = useState(null); // casusun tahmin için seçtiği mekân
  const [sure, setSure] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const sentTimeout = useRef(false);
  const g = room?.game;

  // Sunucu kalan süreyi gönderir; yerel saat farkından etkilenmemek için bitiş anını burada hesaplarız.
  useEffect(() => {
    if (g) { setDeadline(Date.now() + g.leftMs); setNow(Date.now()); sentTimeout.current = false; }
    if (!g || g.over) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [room?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = g && !g.over ? Math.max(0, deadline - now) : 0;
  const me = room?.me ?? -1;
  const seated = me >= 0 && !room?.seats[me]?.left;
  useEffect(() => {
    if (g && !g.over && seated && deadline && left === 0 && !sentTimeout.current) {
      sentTimeout.current = true;
      send('timeout');
    }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!room) return <p className="mono-where">{err || 'Masa açılıyor…'}</p>;

  if (room.phase === 'lobby') {
    return (
      <Lobby
        masaNo={masa.replace('masa-', '')} room={room} ui={ui} max={8} min={3}
        seatNote={(k) => (k === 0 ? 'masayı açan' : '')}
      />
    );
  }

  const names = room.seats.map((s) => s.name);
  const active = room.seats.map((s, i) => (s.left ? -1 : i)).filter((i) => i >= 0);
  const over = g.over;
  const vote = g.vote;
  const canVote = seated && vote && me !== vote.target && vote.votes[me] === undefined;
  const voters = vote ? active.filter((i) => i !== vote.target) : [];
  const canAccuse = seated && !over && !vote && !g.accused.includes(me);

  return (
    <div className="sf">
      {!seated && <p className="mono-where">Tur başladı; izleyici olarak takip ediyorsunuz.</p>}

      {!over && (
        <div className={`sf-timer${left < 60000 ? ' low' : ''}`} role="timer" aria-label="Kalan süre">{fmt(left)}</div>
      )}
      {g.note && !over && <p className="sf-note">{g.note}</p>}

      {seated && g.me && (
        <section className="sf-card">
          <button className="btn" onClick={() => setShow((v) => !v)}>{show ? 'Kartımı gizle' : 'Kartımı göster'}</button>
          {show ? (
            g.me.spy ? (
              <div className="sf-secret spy">
                <b>Casussun!</b>
                <span>Mekânı bilmiyorsun. Sorulardan anla ve aşağıdan tahmin et.</span>
              </div>
            ) : (
              <div className="sf-secret">
                <span>Mekân</span><b>{LOCATIONS[g.me.loc].name}</b>
                <span>Rolün</span><b>{g.me.role}</b>
              </div>
            )
          ) : (
            <div className="sf-secret hidden" aria-hidden="true">🕵️</div>
          )}
        </section>
      )}

      {over && (
        <section className={`sf-over ${over.winner}`} role="status">
          <div className="sf-trophy" aria-hidden="true">{over.winner === 'players' ? '🏆' : over.winner === 'spy' ? '🕵️' : '🤝'}</div>
          <p>{over.text}</p>
          <p className="sf-reveal">Casus: <b>{names[over.spy]}</b> · Mekân: <b>{LOCATIONS[over.loc].name}</b></p>
          {seated && <button className="btn primary" disabled={busy} onClick={() => { setShow(false); setPick(null); send('reset'); }}>Yeni tur (lobiye dön)</button>}
        </section>
      )}

      <section className="sf-players">
        <h2>Oyuncular</h2>
        <ul>
          {room.seats.map((s, i) => (
            <li key={i} className={`${s.left ? 'gone' : ''}${i === me ? ' me' : ''}`}>
              <span className="nm">
                {s.name}{i === me ? ' (sen)' : ''}
                {!over && i === g.first && <em>ilk soran</em>}
                {over && g.roles && <em>{i === over.spy ? 'casus' : g.roles[i]}</em>}
              </span>
              {canAccuse && i !== me && !s.left && (
                <button className="btn sm" disabled={busy} onClick={() => send('accuse', { target: i })}>Suçla</button>
              )}
            </li>
          ))}
        </ul>
        {canAccuse && <p className="sf-help">Herkes turda bir kez birini suçlayabilir. Suçlanan dışındaki herkes &quot;evet&quot; derse sonuç belli olur.</p>}
      </section>

      {vote && !over && (
        <section className="sf-vote" role="alert">
          <p><b>{names[vote.by]}</b>, <b>{names[vote.target]}</b> kişisini casus olmakla suçluyor.</p>
          <p className="sf-help">Evet diyenler: {Object.keys(vote.votes).length}/{voters.length}</p>
          {canVote ? (
            <div className="gm-row">
              <button className="btn primary" disabled={busy} onClick={() => send('vote', { yes: true })}>Evet, casus o</button>
              <button className="btn" disabled={busy} onClick={() => send('vote', { yes: false })}>Hayır</button>
            </div>
          ) : (
            <p className="sf-help">{me === vote.target ? 'Suçlanan siz olduğunuz için oy veremezsiniz.' : seated ? 'Oyunuzu verdiniz, diğerleri bekleniyor…' : ''}</p>
          )}
        </section>
      )}

      <section className="sf-locs">
        <h2>{seated && g.me?.spy && !over ? 'Mekânı tahmin et' : 'Mekânlar'}</h2>
        {seated && !g.me?.spy && !over && <p className="sf-help">Elediğin mekânlara dokunarak üstünü çizebilirsin. Bu sadece sende görünür.</p>}
        <ul>
          {LOCATIONS.map((l, i) => {
            const spyGuessing = seated && g.me?.spy && !over;
            return (
              <li key={l.name}>
                <button
                  className={`sf-loc${struck.has(i) && !spyGuessing ? ' off' : ''}${pick === i ? ' pick' : ''}`}
                  onClick={() => {
                    if (spyGuessing) setPick(i);
                    else setStruck((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });
                  }}
                >{l.name}</button>
              </li>
            );
          })}
        </ul>
        {seated && g.me?.spy && !over && pick !== null && (
          <div className="sf-guess">
            <p>Mekân <b>{LOCATIONS[pick].name}</b> mı? Yanlışsan tur biter ve kaybedersin.</p>
            <div className="gm-row">
              <button className="btn primary" disabled={busy} onClick={() => { send('guess', { loc: pick }); setPick(null); }}>Evet, tahmin et</button>
              <button className="btn" onClick={() => setPick(null)}>Vazgeç</button>
            </div>
          </div>
        )}
      </section>

      {err && <p className="mono-err" role="alert">{err}</p>}
      {seated && !over && (
        sure
          ? <button className="btn sm danger" disabled={busy} onClick={() => { setSure(false); send('leave'); }}>Evet, masadan ayrıl</button>
          : <button className="btn sm" onClick={() => setSure(true)}>Masadan ayrıl</button>
      )}
    </div>
  );
}
