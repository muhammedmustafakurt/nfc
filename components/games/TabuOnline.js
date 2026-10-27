'use client';
import { useEffect, useRef, useState } from 'react';
import Lobby from './Lobby';
import useRoom from './useRoom';
import { TEAM, TURN_MS } from '@/lib/tabu';

const RING = 2 * Math.PI * 54;
const fmt = (ms) => `${Math.max(0, Math.ceil(ms / 1000))}`;
const CONFETTI = ['🎉', '✨', '🏆', '🎊', '⭐'];

// Masada Tabu: anlatıcı ve rakip takım kartı görür, takım arkadaşları tahmin eder.
export default function TabuOnline({ cafe, masa }) {
  const ui = useRoom({ cafe, masa, game: 'tabu' });
  const { room, err, busy, send } = ui;
  const [sure, setSure] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const sent = useRef(false);
  const g = room?.game;
  const running = g?.turn.phase === 'run';

  // Sunucu kalan süreyi gönderir; yerel saat farkından etkilenmemek için bitiş anını burada hesaplarız.
  useEffect(() => {
    if (g) { setDeadline(Date.now() + g.turn.leftMs); setNow(Date.now()); sent.current = false; }
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
      send('timeout');
    }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!room) return <p className="mono-where">{err || 'Masa açılıyor…'}</p>;

  if (room.phase === 'lobby') {
    return (
      <Lobby
        masaNo={masa.replace('masa-', '')} room={room} ui={ui} max={10} min={4}
        seatNote={(k) => (k === 0 ? 'masayı açan' : '')}
      />
    );
  }

  const names = room.seats.map((s) => s.name);
  const t = g.turn;
  const over = g.over;
  const info = seated ? g.me : null; // { team, describer, judge }
  const frac = running ? Math.min(1, left / TURN_MS) : 0;
  const urgency = left < 10000 ? 'low' : left < 20000 ? 'mid' : '';

  return (
    <div className="tb">
      {!seated && <p className="mono-where">Oyun başladı; izleyici olarak takip ediyorsunuz.</p>}

      <div className="tb-score">
        {['r', 'b'].map((tm) => (
          <div key={tm} className={`tb-team ${tm}${t.team === tm && !over ? ' on' : ''}${over?.winner === tm ? ' won' : ''}`}>
            <span>{TEAM[tm]}</span>
            <b>{g.score[tm]}</b>
            <small>{g.order[tm].map((i) => names[i]).join(', ')}</small>
          </div>
        ))}
      </div>
      {info && <p className={`tb-role ${info.team}`}>{TEAM[info.team]} takım · {over ? 'oyun bitti' : t.team === info.team ? (info.describer ? 'Sen anlatıyorsun!' : 'Tahmin et!') : 'Hakemsin: yasaklı kelimeyi yakala'}</p>}

      {over ? (
        <section className={`tb-over ${over.winner}`} role="status">
          <div className="tb-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.3}s`, animationDuration: `${2.4 + (i % 4) * 0.4}s` }}>{CONFETTI[i % CONFETTI.length]}</span>
            ))}
          </div>
          <div className="tb-trophy" aria-hidden="true">{over.winner === 'none' ? '🤝' : '🏆'}</div>
          <p>{over.text}</p>
          {seated && <button className="btn primary" disabled={busy} onClick={() => send('reset')}>Yeni oyun (lobiye dön)</button>}
        </section>
      ) : (
        <>
          <p className="tb-turn">Tur {Math.min(g.turnNo + 1, g.total)}/{g.total} · Sıra <b>{TEAM[t.team]}</b> takımda · Anlatıcı <b>{names[t.describer]}</b></p>

          {t.phase === 'ready' && (
            <section className={`tb-ready ${t.team}`}>
              {info?.describer ? (
                <>
                  <p>Hazır olunca başla. {Math.round(TURN_MS / 1000)} saniyen var, {3} pas hakkın var.</p>
                  <button className="btn primary tb-go" disabled={busy} onClick={() => send('begin')}>Başla</button>
                </>
              ) : (
                <p>{names[t.describer]} hazır olunca başlayacak…</p>
              )}
            </section>
          )}

          {running && (
            <>
              <div className={`sf-clock ${urgency}`} role="timer" aria-label="Kalan süre">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="track" cx="60" cy="60" r="54" />
                  <circle className="bar" cx="60" cy="60" r="54" strokeDasharray={RING} strokeDashoffset={RING * (1 - frac)} />
                </svg>
                <span>{fmt(left)}</span>
              </div>
              <p className="tb-count">✓ {t.ok} doğru · ✗ {t.tabu} tabu · {t.passes} pas hakkı</p>

              {t.card ? (
                <section className={`tb-card ${info?.describer ? 'me' : 'judge'}`}>
                  <b className="word">{t.card.w}</b>
                  <ul>{t.card.t.map((x) => <li key={x}>{x}</li>)}</ul>
                  {info?.describer ? (
                    <div className="tb-btns">
                      <button className="btn pass" disabled={busy || t.passes <= 0} onClick={() => send('pass')}>Pas ({t.passes})</button>
                      <button className="btn primary ok" disabled={busy} onClick={() => send('right')}>Doğru ✓</button>
                    </div>
                  ) : (
                    <button className="btn tabu" disabled={busy} onClick={() => send('taboo')}>TABU!</button>
                  )}
                  <small>{info?.describer ? 'Yasaklı kelimeleri söyleme!' : 'Anlatıcı yasaklı kelimeyi söylerse bas.'}</small>
                </section>
              ) : (
                <section className="tb-guess">
                  <span aria-hidden="true">🤔</span>
                  <p>{names[t.describer]} anlatıyor. Kelimeyi tahmin edin!</p>
                </section>
              )}
            </>
          )}

          {g.note && t.phase === 'ready' && g.history.length > 0 && <p className="tb-note">{g.note}</p>}
        </>
      )}

      {g.history.length > 0 && (
        <section className="tb-hist">
          <h2>Son turlar</h2>
          <ul>
            {[...g.history].reverse().map((h, i) => (
              <li key={i}>
                <div className={`hd ${h.team}`}>{names[h.describer]} ({TEAM[h.team]}) <b>{h.delta >= 0 ? '+' : ''}{h.delta}</b></div>
                <div className="chips">{h.log.map((x, j) => <span key={j} className={x.r}>{x.w}</span>)}</div>
              </li>
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
