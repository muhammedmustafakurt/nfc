'use client';
import { useEffect, useRef, useState } from 'react';
import CityArt, { CITY_OF } from './CityArt';
import { TILES, COLORS, fmt, newGame, roll, buy, skipBuy, rentOf } from '@/lib/emlak';

// Tahtanın kenarı boyunca 7x7 ızgarada saat yönünde yerleşim (0. kare sağ alt köşe).
function cell(i) {
  if (i <= 6) return [6, 6 - i];
  if (i <= 12) return [12 - i, 0];
  if (i <= 18) return [0, i - 12];
  return [i - 18, 6];
}

// Mülklerin renk grupları (aynı renkteki iki mülk bir grup) ve özel karelerin simgeleri.
const BAND = { 1: '#8b5a2b', 2: '#8b5a2b', 3: '#4fb3e8', 5: '#4fb3e8', 7: '#e0559b', 8: '#e0559b', 10: '#f08a24', 11: '#f08a24', 13: '#d64545', 14: '#d64545', 16: '#e8c230', 17: '#e8c230', 20: '#2e9e5b', 21: '#2e9e5b', 23: '#1d2a8f' };
const ICON = { go: '🏁', jail: '🔒', park: '🅿️', gojail: '👮', tax: '💸', chance: '❓' };
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const CONFETTI = ['🎉', '✨', '💰', '🪙', '🎊'];

const die = () => 1 + Math.floor(Math.random() * 6);

function Die({ n, i }) {
  return (
    <span className="die3" style={{ '--d': i }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, k) => <i key={k} className={PIPS[n].includes(k) ? 'on' : undefined} />)}
    </span>
  );
}

// Oyun ekranı: yalnızca g (oyun durumu) ve hamle işleyicilerini alır; tek telefon ve masa (çok oyunculu) kipinde ortak kullanılır.
// meIdx: bu telefondaki oyuncunun sırası (tek telefonda null); canAct: şu an hamle yapabilir mi.
export function Board({ g, meIdx = null, canAct = true, onRoll, onBuy, onSkip, onNew, newLabel = 'Yeni oyun' }) {
  const [shown, setShown] = useState([]); // ekranda görünen taş konumları (adım adım ilerler)
  const [hop, setHop] = useState(null);
  const [deltas, setDeltas] = useState({});
  const [log, setLog] = useState([]);
  const prevMoney = useRef(null);

  // Taşı hedefe kare kare yürüt; çok uzak sıçramalarda (hapse gitme) doğrudan atla.
  useEffect(() => {
    if (!g) { setShown((s) => (s.length ? [] : s)); return; }
    if (shown.length !== g.players.length) { setShown(g.players.map((p) => p.pos)); return; }
    const k = g.players.findIndex((p, i) => shown[i] !== p.pos);
    if (k < 0) { setHop(null); return; }
    const dist = (g.players[k].pos - shown[k] + TILES.length) % TILES.length;
    const id = setTimeout(() => {
      setHop(k);
      setShown((s) => s.map((v, i) => (i === k ? (dist > 12 ? g.players[k].pos : (v + 1) % TILES.length) : v)));
    }, 170);
    return () => clearTimeout(id);
  }, [g, shown]);

  // Para değişimini oyuncu kartında kısa süre yüzen rakamla göster.
  useEffect(() => {
    if (!g) { prevMoney.current = null; setDeltas({}); return; }
    const cur = g.players.map((p) => p.money);
    const d = {};
    if (prevMoney.current?.length === cur.length) cur.forEach((m, i) => { if (m !== prevMoney.current[i]) d[i] = m - prevMoney.current[i]; });
    prevMoney.current = cur;
    setDeltas(d);
    const t = setTimeout(() => setDeltas({}), 2000);
    return () => clearTimeout(t);
  }, [g]);

  useEffect(() => {
    if (!g) { setLog([]); return; }
    setLog((l) => (l[0] === g.msg ? l : [g.msg, ...l].slice(0, 6)));
  }, [g]);

  const mover = shown.length === g.players.length ? g.players.findIndex((p, i) => shown[i] !== p.pos) : -1;
  const moving = mover >= 0;
  const cur = g.players[g.turn];
  const mine = (k) => Object.values(g.owner).filter((x) => x === k).length;
  const curTile = TILES[cur.pos];
  const over = g.phase === 'over';

  return (
    <div className="gm-box">
      <div className="mono-board">
        {TILES.map((t, i) => {
          const [r, c] = cell(i);
          const o = g.owner[i];
          const active = !over && shown[moving ? mover : g.turn] === i;
          return (
            <div
              key={i}
              className={`mono-tile ${t.t}${o !== undefined ? ' owned' : ''}${active ? ' active' : ''}`}
              style={{ gridRow: r + 1, gridColumn: c + 1, '--own': o !== undefined ? COLORS[o] : undefined }}
            >
              {BAND[i] && <b className="band" style={{ background: BAND[i] }} />}
              {CITY_OF[i] && <CityArt id={CITY_OF[i]} color={BAND[i]} />}
              {ICON[t.t] && <em className="ico">{ICON[t.t]}</em>}
              <span>{t.n}</span>
              {t.price && <small>{o !== undefined ? <>kira {fmt(rentOf(g, i, o))}</> : fmt(t.price)}</small>}
              {t.price && o === undefined && <small className="rent">kira {fmt(t.rent * 2)}</small>}
              <div className="mono-tokens">
                {g.players.map((p, k) => !p.out && shown[k] === i && (
                  <i key={k} className={`tok${hop === k ? ' hop' : ''}`} style={{ background: COLORS[k] }}>{k + 1}</i>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mono-center">
          {over ? (
            <>
              <div className="mono-win" aria-hidden="true">🏆</div>
              <p className="mono-msg" role="status">{g.msg}</p>
              <button className="btn primary" onClick={onNew}>{newLabel}</button>
            </>
          ) : (
            <>
              {g.phase === 'buy' && !moving ? (
                <div className="deed">
                  <div className="deed-head" style={{ background: BAND[cur.pos] }}>Tapu</div>
                  <div className="deed-art"><CityArt id={CITY_OF[cur.pos]} color={BAND[cur.pos]} className="deed-svg" /></div>
                  <h3>{curTile.n}</h3>
                  <p>Fiyat <b>{fmt(curTile.price)}</b></p>
                  <p>Kira <b>{fmt(curTile.rent * (2 + mine(g.turn)))}</b></p>
                  <p><small>Sahip olduğun her yeni mülkte kira {fmt(curTile.rent)} artar.</small></p>
                </div>
              ) : (
                <div className="mono-logo" aria-hidden="true"><span>👑</span>Emlak Krallığı</div>
              )}
              <p className="mono-msg" role="status">
                {moving ? `${g.players[mover].name} ilerliyor…` : g.msg}
              </p>
              {!moving && !canAct && meIdx !== null && <p className="mono-wait">{cur.name} oynuyor, bekleyin…</p>}
              {g.dice && (
                <div className="mono-dice" key={`${g.dice}${g.turn}${g.phase}`} aria-label={`Zar: ${g.dice[0]} ve ${g.dice[1]}`}>
                  <Die n={g.dice[0]} i={0} /><Die n={g.dice[1]} i={1} />
                </div>
              )}
              {g.phase === 'roll' && (
                <button className="btn primary mono-act" disabled={moving || !canAct} onClick={onRoll}>Zar at</button>
              )}
              {g.phase === 'buy' && (
                <div className="gm-row mono-act-row">
                  <button className="btn primary mono-act" disabled={moving || !canAct} onClick={onBuy}>Satın al</button>
                  <button className="btn mono-act" disabled={moving || !canAct} onClick={onSkip}>Geç</button>
                </div>
              )}
            </>
          )}
        </div>

        {over && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.25}s`, animationDuration: `${2.6 + (i % 5) * 0.4}s` }}>{CONFETTI[i % CONFETTI.length]}</span>
            ))}
          </div>
        )}
      </div>

      <ul className="mono-players">
        {g.players.map((p, k) => {
          const owned = Object.keys(g.owner).filter((i) => g.owner[i] === k).map(Number);
          return (
            <li key={k} className={k === g.turn && !over ? 'on' : undefined} style={{ '--pc': COLORS[k], opacity: p.out ? 0.45 : 1 }}>
              <i className="av">{k + 1}</i>
              <div className="pn">
                <b>{p.name}{k === meIdx ? ' (sen)' : ''}</b>
                <span>{p.out ? 'Oyunda değil' : k === g.turn && !over ? (meIdx === null || k === meIdx ? 'Sıra sizde' : 'Sırası geldi') : `${owned.length} mülk`}</span>
                {owned.length > 0 && (
                  <span className="chips">
                    {owned.map((i) => <u key={i} title={TILES[i].n} style={{ background: BAND[i] }} />)}
                  </span>
                )}
              </div>
              <div className="pm">
                {fmt(p.money)}
                {deltas[k] !== undefined && <em key={`${k}${deltas[k]}${g.msg}`} className={deltas[k] > 0 ? 'up' : 'down'}>{deltas[k] > 0 ? '+' : '−'}{fmt(Math.abs(deltas[k]))}</em>}
              </div>
            </li>
          );
        })}
      </ul>

      {log.length > 1 && (
        <ul className="mono-log" aria-label="Son olaylar">
          {log.slice(1).map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      )}
    </div>
  );
}

// Tek telefonda sırayla oynanan kip.
export default function Monopoly() {
  const [g, setG] = useState(null);
  if (!g) {
    return (
      <div className="mono-start">
        <div className="mono-crown" aria-hidden="true">👑</div>
        <p>Mülkleri al, kira topla, rakiplerini iflas ettir. Aynı telefonda sırayla oynanır.</p>
        <p className="mono-ask">Kaç kişisiniz?</p>
        <div className="gm-row">
          {[2, 3, 4].map((n) => (
            <button key={n} className="btn primary mono-n" onClick={() => setG(newGame(n))}>
              <span className="mono-dots">{Array.from({ length: n }, (_, k) => <i key={k} style={{ background: COLORS[k] }} />)}</span>
              {n} kişi
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Board
      g={g}
      onRoll={() => setG(roll(g, die(), die(), Math.floor(Math.random() * 4)))}
      onBuy={() => setG(buy(g))}
      onSkip={() => setG(skipBuy(g))}
      onNew={() => setG(null)}
    />
  );
}
