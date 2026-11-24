import { useEffect, useRef, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { lv } from '../../utils/level';
import { Cell } from '../common/Cell';
import { useLoop } from '../common/hooks';
import { sfx } from '../../engine/sound';

const W = 100;
const H = 60;
interface Mol { x: number; y: number; taken: boolean }

/** Steruj erytrocytem: zbierz O₂ w płucach, dostarcz do tkanek (wyżej: zabierz CO₂ do płuc). */
export default function OxygenTransport(p: MiniGameProps) {
  const needCO2 = p.level !== 'primary';
  const nO2 = lv(p.level, 3, 3, 4) + (p.intensity === 2 ? 1 : 0);
  const [, force] = useState(0);
  const st = useRef<{ x: number; y: number; tx: number | null; ty: number | null; o2: Mol[]; co2: Mol[]; phase: 'collect' | 'deliver' | 'co2' | 'back' | 'done'; carried: number } | null>(null);
  if (!st.current) {
    st.current = {
      x: 50, y: 30, tx: null, ty: null, carried: 0, phase: 'collect',
      o2: Array.from({ length: nO2 }, () => ({ x: 5 + p.rng() * 17, y: 8 + p.rng() * 44, taken: false })),
      co2: [],
    };
  }
  const keys = useRef<Record<string, boolean>>({});
  const field = useRef<HTMLDivElement>(null);
  const speed = lv(p.level, 46, 52, 58);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key.startsWith('Arrow') || 'wasd'.includes(e.key)) { keys.current[e.key] = true; e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useLoop((dt) => {
    const s = st.current!;
    if (s.phase === 'done') return;
    const k = keys.current;
    let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0);
    let dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
    if (dx || dy) { s.tx = null; s.ty = null; }
    else if (s.tx != null && s.ty != null) {
      const ddx = s.tx - s.x, ddy = s.ty - s.y, d = Math.hypot(ddx, ddy);
      if (d > 1) { dx = ddx / d; dy = ddy / d; }
    }
    const len = Math.hypot(dx, dy) || 1;
    s.x = Math.max(3, Math.min(W - 3, s.x + (dx / len) * speed * dt));
    s.y = Math.max(4, Math.min(H - 4, s.y + (dy / len) * speed * dt));
    const grab = (arr: Mol[]) => arr.forEach((m) => { if (!m.taken && Math.hypot(m.x - s.x, m.y - s.y) < 7) { m.taken = true; s.carried++; sfx('pop'); } });
    if (s.phase === 'collect') {
      grab(s.o2);
      if (s.o2.every((m) => m.taken)) s.phase = 'deliver';
    } else if (s.phase === 'deliver' && s.x > 78) {
      s.carried = 0;
      sfx('good');
      if (!needCO2) { s.phase = 'done'; p.onDone({ success: true, info: tr('Erytrocyt zabrał tlen w płucach i oddał go w naczyniach włosowatych tkanek.', 'The erythrocyte picked up oxygen in the lungs and released it in the tissue capillaries.') }); }
      else { s.phase = 'co2'; s.co2 = Array.from({ length: 2 }, () => ({ x: 82 + p.rng() * 13, y: 8 + p.rng() * 44, taken: false })); }
    } else if (s.phase === 'co2') {
      grab(s.co2);
      if (s.co2.every((m) => m.taken)) s.phase = 'back';
    } else if (s.phase === 'back' && s.x < 22) {
      s.phase = 'done';
      p.onDone({ success: true, info: tr('Tlen trafił do tkanek, a CO₂ do płuc. Erytrocyty przenoszą część CO₂; większość płynie w osoczu jako jony HCO₃⁻.', 'Oxygen reached the tissues and CO₂ the lungs. Erythrocytes carry some CO₂; most travels in plasma as HCO₃⁻ ions.') });
    }
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const setTarget = (e: React.PointerEvent) => {
    const r = field.current!.getBoundingClientRect();
    st.current!.tx = ((e.clientX - r.left) / r.width) * W;
    st.current!.ty = ((e.clientY - r.top) / r.height) * H;
  };
  const s = st.current;
  const goal = tr({ collect: 'Zbierz O₂ w płucach', deliver: 'Dostarcz O₂ do TKANEK →', co2: 'Zabierz CO₂ z tkanek', back: '← Zanieś CO₂ do PŁUC', done: 'Gotowe!' }, { collect: 'Collect O₂ in the lungs', deliver: 'Deliver O₂ to the TISSUES →', co2: 'Pick up CO₂ from the tissues', back: '← Take CO₂ to the LUNGS', done: 'Done!' })[s.phase];
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Steruj erytrocytem: <b>kliknij/dotknij</b> miejsce na planszy (lub strzałki/WSAD). Cel: </>, <>Steer the erythrocyte: <b>click/tap</b> a spot on the board (or arrows/WASD). Goal: </>)}<b>{goal}</b></p>
      <div className="field transport" ref={field} style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={(e) => { setTarget(e); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (e.buttons) setTarget(e); }}>
        <div className="zone lungs"><span>{tr('PŁUCA', 'LUNGS')}<br /><small>{tr('pęcherzyki płucne', 'alveoli')}</small></span></div>
        <div className="zone tissue"><span>{tr('TKANKI', 'TISSUES')}<br /><small>{tr('naczynia włosowate', 'capillaries')}</small></span></div>
        {[...s.o2, ...s.co2].map((m, i) => !m.taken && (
          <span key={i} className="mol" style={{ left: `${(m.x / W) * 100}%`, top: `${(m.y / H) * 100}%` }}>
            <Cell kind={i < s.o2.length ? 'o2' : 'co2'} size={46} label={i < s.o2.length ? tr('tlen', 'oxygen') : tr('dwutlenek węgla', 'carbon dioxide')} />
          </span>
        ))}
        <span className="player" style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}>
          <Cell kind="rbc" size={62} label={tr('Twój erytrocyt', 'Your erythrocyte')} />
          {s.carried > 0 && <span className="carry">{s.carried}</span>}
        </span>
      </div>
    </div>
  );
}
