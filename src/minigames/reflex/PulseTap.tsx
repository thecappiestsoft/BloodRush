import { useEffect, useRef, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { sfx } from '../../engine/sound';

/** Wystukaj rytm serca o podanym tętnie. */
export default function PulseTap(p: MiniGameProps) {
  const [task] = useState(() => {
    if (p.level === 'primary') return { bpm: 60, taps: 5, tol: 0.25, text: tr(<>Wystukaj <b>5 uderzeń</b> w tempie <b>60 na minutę</b> (1 uderzenie na sekundę).</>, <>Tap <b>5 beats</b> at <b>60 per minute</b> (1 beat per second).</>) };
    if (p.level === 'highschool') { const bpm = pick(p.rng, [60, 75, 90]); return { bpm, taps: 6, tol: 0.2, text: tr(<>Tętno: <b>{bpm}/min</b>. Wystukaj <b>6 uderzeń</b> w tym rytmie.</>, <>Pulse: <b>{bpm}/min</b>. Tap <b>6 beats</b> at this rate.</>) }; }
    const beats = pick(p.rng, [15, 18, 20, 22]);
    return { bpm: beats * 4, taps: 6, tol: 0.17, text: tr(<>W ciągu <b>15 s</b> naliczono <b>{beats}</b> uderzeń. Oblicz tętno na minutę i wystukaj <b>6 uderzeń</b> w tym rytmie.</>, <><b>{beats}</b> beats were counted in <b>15 s</b>. Work out the pulse per minute and tap <b>6 beats</b> at that rate.</>) };
  });
  const demoBeats = p.level === 'primary' ? 3 : 0;
  const [demo, setDemo] = useState(demoBeats);
  const [taps, setTaps] = useState<number[]>([]);
  const [pulse, setPulse] = useState(false);
  const done = useRef(false);
  const interval = 60000 / task.bpm;

  useEffect(() => {
    if (demo <= 0) { p.startTimer(); return; }
    if (p.paused) return;
    const t = setTimeout(() => {
      sfx('beat');
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
      setDemo((d) => d - 1);
    }, interval);
    return () => clearTimeout(t);
  }, [demo, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = () => {
    if (done.current || demo > 0) return;
    sfx('beat');
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
    const now = performance.now();
    const next = [...taps, now];
    setTaps(next);
    if (next.length >= task.taps) {
      done.current = true;
      const ints = next.slice(1).map((t, i) => t - next[i]);
      const avg = ints.reduce((a, b) => a + b, 0) / ints.length;
      const bpm = Math.round(60000 / avg);
      const ok = Math.abs(avg - interval) / interval <= task.tol;
      p.onDone({ success: ok, info: tr(`Twoje tempo: ok. ${bpm}/min (cel: ${task.bpm}/min). Tętno spoczynkowe dorosłego zwykle mieści się w przedziale ok. 60–100/min.`, `Your rate: about ${bpm}/min (target: ${task.bpm}/min). An adult's resting pulse is usually about 60–100/min.`) });
    }
  };
  return (
    <div className="mg center">
      <p className="prompt">{task.text}</p>
      {demo > 0 && <p className="hint">{tr('Posłuchaj rytmu…', 'Listen to the rhythm…')} ({demo})</p>}
      <button className={`pulse-btn ${pulse ? 'beat' : ''}`} onPointerDown={(e) => { e.preventDefault(); tap(); }} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tap(); } }} disabled={demo > 0} aria-label={tr('Stuknij uderzenie serca', 'Tap a heartbeat')}>
        <svg viewBox="0 0 100 90" width="150" aria-hidden><path d="M50 86 C10 58 0 40 0 24 A24 24 0 0 1 50 12 A24 24 0 0 1 100 24 C100 40 90 58 50 86Z" fill="#e23b4a" stroke="#7a0b14" strokeWidth="5" /></svg>
        <span>{demo > 0 ? '…' : tr('STUKNIJ', 'TAP')}</span>
      </button>
      <div className="tap-dots">{Array.from({ length: task.taps }, (_, i) => <span key={i} className={i < taps.length ? 'on' : ''} />)}</div>
    </div>
  );
}
