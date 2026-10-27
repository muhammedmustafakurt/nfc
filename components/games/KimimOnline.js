'use client';
import { useEffect, useRef, useState } from 'react';
import Lobby from './Lobby';
import useRoom from './useRoom';
import { PALETTE } from '@/lib/emlak';
import { TURN_MS } from '@/lib/kimim';

const RING = 2 * Math.PI * 54;
const MEDAL = ['🥇', '🥈', '🥉'];
const CONFETTI = ['🎉', '✨', '🏆', '🎊', '⭐'];
const HIST = { ok: 'buldu ✓', no: 'yanlış', skip: 'pas', time: 'süre doldu' };

// Masada Ben Kimim?: herkes başkalarının kartını görür, kendi kartını sorularla bulmaya çalışır.
export default function KimimOnline({ cafe, masa }) {
  const ui = useRoom({ cafe, masa, game: 'kimim' });
  const { room, err, busy, send } = ui;
  const [sure, setSure] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const sent = useRef(false);
  const g = room?.game;
  const running = !!g && !g.over;

  // Sunucu kalan süreyi gönderir; yerel saat farkından etkilenmemek için bitiş anını burada hesaplarız.
  useEffect(() => {
    if (g) { setDeadline(Date.now() + g.leftMs); setNow(Date.now()); sent.current = false; }
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [room?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = running ? Math.max(0, deadline - now) : 0;
  const me = room?.me ?? -1;
  const seated = me >= 0 && !room?.seats[me]?.left;
  useEffect(() => {
    if (running && seated && deadline && left === 0 && !sent.current) {
      sent.current = true;
      send('ktimeout');
    }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!room) return <p className="mono-where">{err || 'Masa açılıyor…'}</p>;

  if (room.phase === 'lobby') {
    return (
      <Lobby
        masaNo={masa.replace('masa-', '')} room={room} ui={ui} max={10} min={3}
        seatNote={(k) => (k === 0 ? 'masayı açan' : '')}
      />
    );
  }

  const names = room.seats.map((s) => s.name);
  const over = g.over;
  const myTurn = seated && g.turn === me;
  const mySolved = me >= 0 && g.solved.includes(me);
  const frac = running ? Math.min(1, left / TURN_MS) : 0;
  const urgency = left < 8000 ? 'low' : left < 18000 ? 'mid' : '';
  const rank = (i) => g.solved.indexOf(i);

  return (
    <div className="km">
      {!seated && <p className="mono-where">Oyun başladı; izleyici olarak takip ediyorsunuz.</p>}

      {over ? (
        <section className="km-over" role="status">
          <div className="km-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.3}s`, animationDuration: `${2.4 + (i % 4) * 0.4}s` }}>{CONFETTI[i % CONFETTI.length]}</span>
            ))}
          </div>
          <div className="km-trophy" aria-hidden="true">{g.solved.length ? '🏆' : '🤷'}</div>
          <p>{over.text}</p>
          <ol className="km-rank">
            {over.ranking.map((i, k) => (
              <li key={i}>
                <span className="medal">{k < g.solved.length ? (MEDAL[k] || `${k + 1}.`) : '–'}</span>
                <b>{names[i]}</b>
                <em>{g.cards[i].n}</em>
              </li>
            ))}
          </ol>
          {seated && <button className="btn primary" disabled={busy} onClick={() => send('reset')}>Yeni oyun (lobiye dön)</button>}
        </section>
      ) : (
        <>
          <div className="km-top">
            <div className={`sf-clock ${urgency}`} role="timer" aria-label="Kalan süre">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle className="track" cx="60" cy="60" r="54" />
                <circle className="bar" cx="60" cy="60" r="54" strokeDasharray={RING} strokeDashoffset={RING * (1 - frac)} />
              </svg>
              <span>{Math.ceil(left / 1000)}</span>
            </div>
            <p className="km-turn">
              Sıra <b>{myTurn ? 'sende' : names[g.turn]}</b>
              <small>Tur {Math.min(g.turnNo + 1, g.maxTurns)}/{g.maxTurns}</small>
            </p>
          </div>

          {myTurn ? (
            <section className="km-act me">
              <p>Masaya <b>evet/hayır</b> soruları sor. Bildiğini düşünüyorsan yüksek sesle tahmin et; diğerleri onaylasın.</p>
              <button className="btn" disabled={busy} onClick={() => send('kskip')}>Sırayı bitir</button>
            </section>
          ) : seated ? (
            <section className="km-act">
              <p><b>{names[g.turn]}</b> tahmin ediyor. Kartı sen görüyorsun: <b>{g.cards[g.turn].n}</b></p>
              <div className="km-btns">
                <button className="btn" disabled={busy} onClick={() => send('kno')}>Yanlış ✗</button>
                <button className="btn primary ok" disabled={busy} onClick={() => send('kok')}>Doğru ✓</button>
              </div>
            </section>
          ) : null}
          {g.note && <p className="km-note">{g.note}</p>}
        </>
      )}

      <ul className="km-grid">
        {g.cards.map((c, i) => {
          const done = g.solved.includes(i);
          const self = i === me;
          const hidden = c.n === null;
          return (
            <li key={i} className={`km-card${!over && g.turn === i ? ' on' : ''}${done ? ' done' : ''}${self ? ' self' : ''}${room.seats[i].left ? ' left' : ''}`}>
              <div className="who">
                <i className="av" style={{ background: PALETTE[i % PALETTE.length] }}>{i + 1}</i>
                <span>{names[i]}{self ? ' (sen)' : ''}</span>
                {done && <span className="medal" aria-label={`${rank(i) + 1}. oldu`}>{MEDAL[rank(i)] || `${rank(i) + 1}.`}</span>}
              </div>
              <div className="band">
                <small>{c.c}</small>
                <b>{hidden ? '❓ ???' : c.n}</b>
              </div>
            </li>
          );
        })}
      </ul>
      {seated && !over && (
        <p className="km-hint">{mySolved ? 'Kartını buldun! Diğerlerine yardım ederken onay vermeye devam et.' : 'Kendi kartının adı sana gösterilmez; yalnızca türünü görürsün.'}</p>
      )}

      {g.history.length > 0 && (
        <section className="km-hist">
          <h2>Son hamleler</h2>
          <ul>
            {[...g.history].reverse().map((h, i) => (
              <li key={i} className={h.r}>{names[h.seat]} · {HIST[h.r]}{h.card ? ` (${h.card})` : ''}</li>
            ))}
          </ul>
        </section>
      )}

      {err && <p className="mono-err" role="alert">{err}</p>}
      {seated && !over && (
        sure
          ? <button className="btn sm danger" disabled={busy} onClick={() => { setSure(false); send('leave'); }}>Evet, masadan ayrıl</button>
          : <button className="btn sm" onClick={() => setSure(true)}>Masadan ayrıl</button>
      )}
    </div>
  );
}
