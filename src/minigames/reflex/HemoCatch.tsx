import { useEffect, useRef, useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { lv } from '../../utils/level';
import { Cell } from '../common/Cell';
import { useLoop, useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

interface Drop { id: number; kind: CellKind; x: number; y: number; v: number; gone: boolean }

/** Załaduj hemoglobinę: łap O₂ do czterech hemów, unikaj CO. */
export default function HemoCatch(p: MiniGameProps) {
  const withCO = p.level !== 'primary';
  const [, force] = useState(0);
  const st = useRef({ x: 50, drops: [] as Drop[], next: 0.2, t: 0, n: 0, caught: 0, done: false });
  const keys = useRef({ l: false, r: false });
  const box = useRef<HTMLDivElement>(null);
  const mistake = useMistakes(p, lv(p.level, 9, 1, 0));
  const fall = lv(p.level, 15, 18, 21) * (1 + p.intensity * 0.1);

  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keys.current.l = true; if (e.key === 'ArrowRight') keys.current.r = true; };
    const u = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keys.current.l = false; if (e.key === 'ArrowRight') keys.current.r = false; };
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, []);

  useLoop((dt) => {
    const s = st.current;
    if (s.done) return;
    s.t += dt;
    s.x = Math.max(6, Math.min(94, s.x + ((keys.current.r ? 1 : 0) - (keys.current.l ? 1 : 0)) * 70 * dt));
    if (s.t >= s.next) {
      const bad = withCO && p.rng() < lv(p.level, 0, 0.3, 0.4);
      const kind: CellKind = bad ? 'co' : p.level === 'technical' && p.rng() < 0.2 ? 'co2' : 'o2';
      s.drops.push({ id: s.n++, kind, x: 8 + p.rng() * 84, y: 0, v: fall * (0.8 + p.rng() * 0.4), gone: false });
      s.next = s.t + lv(p.level, 0.9, 0.8, 0.7);
    }
    for (const d of s.drops) {
      if (d.gone) continue;
      d.y += d.v * dt;
      if (d.y > 78 && d.y < 92 && Math.abs(d.x - s.x) < 12) {
        d.gone = true;
        if (d.kind === 'o2') {
          s.caught++;
          sfx('pop');
          if (s.caught >= 4) {
            s.done = true;
            p.onDone({ success: true, info: tr('Hemoglobina ma 4 hemy – każdy z jonem żelaza wiąże jedną cząsteczkę O₂.', 'Haemoglobin has 4 haem groups – each with an iron ion binds one O₂ molecule.') });
          }
        } else {
          mistake(d.kind === 'co' ? tr('Tlenek węgla (CO) wiąże się z hemoglobiną dużo silniej niż tlen i blokuje transport O₂!', 'Carbon monoxide (CO) binds to haemoglobin far more strongly than oxygen and blocks O₂ transport!') : tr('CO₂ nie jest tu potrzebny – większość CO₂ krąży jako HCO₃⁻ w osoczu.', 'CO₂ is not needed here – most CO₂ travels as HCO₃⁻ in plasma.'));
        }
      }
      if (d.y > 100) d.gone = true;
    }
    s.drops = s.drops.filter((d) => !d.gone || d.y < 0);
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const s = st.current;
  const move = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    s.x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100));
  };
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Przesuwaj erytrocyt (mysz, palec lub ← →) i <b>łap O₂</b> do 4 hemów hemoglobiny</>, <>Move the erythrocyte (mouse, finger or ← →) and <b>catch O₂</b> for the 4 haem groups of haemoglobin</>)}{withCO ? tr(<>. Unikaj <b>CO</b>!</>, <>. Avoid <b>CO</b>!</>) : '.'}</p>
      <div className="field hemo" ref={box} onPointerMove={move} onPointerDown={move}>
        {s.drops.filter((d) => !d.gone).map((d) => (
          <span key={d.id} className="mol" style={{ left: `${d.x}%`, top: `${d.y}%` }}><Cell kind={d.kind} size={40} label={d.kind} /></span>
        ))}
        <span className="catcher" style={{ left: `${s.x}%` }}>
          <Cell kind="rbc" size={64} label={tr('erytrocyt', 'erythrocyte')} />
          <span className="hemes" aria-label={tr(`Związany tlen: ${s.caught} z 4`, `Oxygen bound: ${s.caught} of 4`)}>
            {[0, 1, 2, 3].map((i) => <span key={i} className={`heme ${i < s.caught ? 'full' : ''}`}>{i < s.caught ? 'O₂' : 'Fe'}</span>)}
          </span>
        </span>
      </div>
      <div className="move-buttons">
        <button className="btn ghost" onPointerDown={() => (keys.current.l = true)} onPointerUp={() => (keys.current.l = false)} onPointerLeave={() => (keys.current.l = false)} aria-label={tr('W lewo', 'Left')}>◀</button>
        <button className="btn ghost" onPointerDown={() => (keys.current.r = true)} onPointerUp={() => (keys.current.r = false)} onPointerLeave={() => (keys.current.r = false)} aria-label={tr('W prawo', 'Right')}>▶</button>
      </div>
    </div>
  );
}
