'use client';
import { useState } from 'react';
import { Board } from './Monopoly';
import Lobby from './Lobby';
import useRoom from './useRoom';

export default function MonopolyOnline({ cafe, masa }) {
  const ui = useRoom({ cafe, masa, game: 'monopoly' });
  const { room, err, busy, send } = ui;
  const [sure, setSure] = useState(false);
  const masaNo = masa.replace('masa-', '');

  if (!room) return <p className="mono-where">{err || 'Masa açılıyor…'}</p>;

  if (room.phase === 'lobby') {
    return <Lobby masaNo={masaNo} room={room} ui={ui} max={4} min={2} seatNote={(k) => (k === 0 ? 'masayı açan' : '')} />;
  }

  const seated = room.me >= 0;
  const g = room.game;
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
        onNew={() => send('reset')}
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
