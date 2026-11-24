import { useEffect, useRef, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, randInt } from '../../utils/random';
import { lv } from '../../utils/level';
import { useLoop } from '../common/hooks';

/** Ciśnieniomierz: zatrzymaj wskazówkę we właściwym zakresie. */
export default function PressureStop(p: MiniGameProps) {
  const [task] = useState(() => {
    const sbp = pick(p.rng, [110, 115, 120, 125, 130]);
    const dbp = pick(p.rng, [70, 75, 80, 85]);
    if (p.level === 'primary')
      return { prompt: tr(<>Zatrzymaj wskazówkę w <b>zielonej strefie</b> – tak mniej więcej wygląda ciśnienie <b>skurczowe</b> zdrowego dorosłego w spoczynku.</>, <>Stop the needle in the <b>green zone</b> – roughly the <b>systolic</b> pressure of a healthy adult at rest.</>), lo: 110, hi: 130, showZone: true, info: tr('Ciśnienie skurczowe (górna liczba w zapisie, np. 120/80) mierzone jest podczas skurczu komór.', 'Systolic pressure (the top number in a reading such as 120/80) is measured while the ventricles contract.') };
    if (p.level === 'highschool' || p.rng() < 0.4) {
      const which = pick(p.rng, ['skurczowe', 'rozkurczowe'] as const);
      const v = which === 'skurczowe' ? sbp : dbp;
      return { prompt: tr(<>Wynik pomiaru: <b>{sbp}/{dbp} mm Hg</b>. Zatrzymaj wskazówkę na ciśnieniu <b>{which === 'skurczowe' ? 'SKURCZOWYM' : 'ROZKURCZOWYM'}</b>.</>, <>Reading: <b>{sbp}/{dbp} mm Hg</b>. Stop the needle at the <b>{which === 'skurczowe' ? 'SYSTOLIC' : 'DIASTOLIC'}</b> pressure.</>), lo: v - 6, hi: v + 6, showZone: false, info: tr(`W zapisie ${sbp}/${dbp} pierwsza liczba to ciśnienie skurczowe, druga – rozkurczowe.`, `In ${sbp}/${dbp} the first number is systolic pressure, the second diastolic.`) };
    }
    const map = Math.round(dbp + (sbp - dbp) / 3);
    return { prompt: tr(<>Pomiar: <b>{sbp}/{dbp} mm Hg</b>. Oblicz średnie ciśnienie tętnicze <b>MAP ≈ DBP + (SBP − DBP)/3</b> i zatrzymaj na nim wskazówkę.</>, <>Reading: <b>{sbp}/{dbp} mm Hg</b>. Work out the mean arterial pressure <b>MAP ≈ DBP + (SBP − DBP)/3</b> and stop the needle on it.</>), lo: map - 5, hi: map + 5, showZone: false, info: tr(`MAP ≈ ${dbp} + (${sbp} − ${dbp})/3 ≈ ${map} mm Hg. To uproszczony wzór szacunkowy.`, `MAP ≈ ${dbp} + (${sbp} − ${dbp})/3 ≈ ${map} mm Hg. This is a simplified estimate.`) };
  });
  const period = lv(p.level, 4.4, 3.6, 3) / (1 + p.intensity * 0.1);
  const phase = useRef(randInt(p.rng, 0, 100) / 100);
  const [val, setVal] = useState(0);
  const stopped = useRef(false);
  useLoop((dt) => {
    if (stopped.current) return;
    phase.current += dt / period;
    setVal(100 - 100 * Math.cos(phase.current * Math.PI * 2) * 0.95);
  }, p.paused);
  const stop = () => {
    if (stopped.current) return;
    stopped.current = true;
    const v = Math.round(val);
    const ok = v >= task.lo && v <= task.hi;
    p.onDone({ success: ok, info: ok ? task.info : tr(`Zatrzymano na ${v} mm Hg (cel: ${task.lo}–${task.hi}). ${task.info}`, `Stopped at ${v} mm Hg (target: ${task.lo}–${task.hi}). ${task.info}`) });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); stop(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const ang = (v: number) => -90 + (v / 200) * 180;
  const pt = (v: number, r: number) => { const a = (ang(v) - 90) * (Math.PI / 180); return [150 + Math.cos(a) * r, 160 + Math.sin(a) * r]; };
  const arc = (a: number, b: number, r: number) => { const [x1, y1] = pt(a, r); const [x2, y2] = pt(b, r); return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`; };
  return (
    <div className="mg">
      <p className="prompt">{task.prompt}</p>
      <div className="gauge">
        <svg viewBox="-24 0 348 190" aria-hidden>
          <path d={arc(0, 200, 120)} stroke="#e2e8f0" strokeWidth="26" fill="none" />
          {task.showZone && <path d={arc(task.lo, task.hi, 120)} stroke="#22c55e" strokeWidth="26" fill="none" />}
          {Array.from({ length: 11 }, (_, i) => i * 20).map((v) => {
            const [x1, y1] = pt(v, 104); const [x2, y2] = pt(v, 136); const [tx, ty] = pt(v, 150);
            return <g key={v}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2" /><text x={tx} y={ty + 4} fontSize="11" textAnchor="middle" fill="#334155">{v}</text></g>;
          })}
          {Array.from({ length: 40 }, (_, i) => i * 5).filter((v) => v % 20).map((v) => { const [x1, y1] = pt(v, 112); const [x2, y2] = pt(v, 128); return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1" />; })}
          <line x1="150" y1="160" x2={pt(val, 110)[0]} y2={pt(val, 110)[1]} stroke="#e23b4a" strokeWidth="5" strokeLinecap="round" />
          <circle cx="150" cy="160" r="10" fill="#1e293b" />
        </svg>
        <div className="gauge-readout">{Math.round(val)} <small>mm Hg</small></div>
      </div>
      <button className="btn big danger stop-btn" onClick={stop}>STOP <small>({tr('spacja', 'space')})</small></button>
    </div>
  );
}
