import { useState } from 'react';
import { tr, groupName } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { pick, shuffle } from '../../utils/random';
import { ABO_ALL, label, plasmaCompatible, rbcCompatible, type ABO, type BloodType } from '../../engine/bloodGroups';
import { ChoiceGrid } from '../common/ChoiceGrid';
import { sfx } from '../../engine/sound';

const ALL: BloodType[] = ABO_ALL.flatMap((abo) => (['+', '−'] as const).map((rh) => ({ abo, rh })));

function Erythrocyte({ abo, rh }: { abo: ABO; rh?: '+' | '−' }) {
  const ags = abo === 'AB' ? ['A', 'B'] : abo === '0' ? [] : [abo];
  const marks: { x: number; y: number; t: string }[] = [];
  const spots = [[0, -52], [50, -16], [32, 44], [-32, 44], [-50, -16], [0, 54]];
  let k = 0;
  for (const ag of ags) for (let i = 0; i < (ags.length === 2 ? 2 : 3); i++) { const [x, y] = spots[k++ % spots.length]; marks.push({ x, y, t: ag }); }
  if (rh === '+') { const [x, y] = spots[k % spots.length]; marks.push({ x, y, t: 'D' }); }
  return (
    <svg viewBox="-75 -75 150 150" width="150" aria-label={`${tr('Erytrocyt z antygenami', 'Erythrocyte with antigens')}: ${marks.length ? [...new Set(marks.map((m) => m.t))].join(', ') : tr('brak antygenów A i B', 'no antigens A or B')}`} role="img">
      <circle r="48" fill="#e23b4a" stroke="#7a0b14" strokeWidth="4" />
      <circle r="22" fill="#f48a92" />
      {marks.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y})`}>
          {m.t === 'A' && <path d="M0 -13 L13 10 L-13 10Z" fill="#ffd23f" stroke="#1e293b" strokeWidth="2.5" />}
          {m.t === 'B' && <rect x="-11" y="-11" width="22" height="22" fill="#7dd3fc" stroke="#1e293b" strokeWidth="2.5" />}
          {m.t === 'D' && <circle r="11" fill="#c4b5fd" stroke="#1e293b" strokeWidth="2.5" />}
          <text y="5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1e293b">{m.t}</text>
        </g>
      ))}
    </svg>
  );
}

/** Dobierz właściwego dawcę / rozpoznaj grupę krwi. */
export default function Donor(p: MiniGameProps) {
  const [task] = useState(() => {
    if (p.level === 'primary') {
      const abo = pick(p.rng, ABO_ALL);
      return { kind: 'identify' as const, abo, opts: shuffle(p.rng, ABO_ALL) };
    }
    const product = p.level === 'technical' && p.rng() < 0.4 ? 'plasma' : 'rbc';
    if (product === 'plasma') {
      const rec = pick(p.rng, ABO_ALL);
      const okAll = ABO_ALL.filter((d) => plasmaCompatible(d, rec));
      const bad = ABO_ALL.filter((d) => !plasmaCompatible(d, rec));
      const good = pick(p.rng, okAll);
      const opts = shuffle(p.rng, [good, ...shuffle(p.rng, bad).slice(0, 3)]);
      if (opts.length < 4) opts.push(...shuffle(p.rng, okAll.filter((x) => x !== good)).slice(0, 4 - opts.length));
      const correctSet = opts.filter((o) => plasmaCompatible(o, rec));
      return { kind: 'plasma' as const, rec, opts, correctSet };
    }
    const rec = pick(p.rng, ALL);
    const compat = ALL.filter((d) => rbcCompatible(d, rec));
    const incompat = ALL.filter((d) => !rbcCompatible(d, rec));
    const good = pick(p.rng, compat);
    const opts = shuffle(p.rng, [good, ...shuffle(p.rng, incompat).slice(0, 3)]);
    return { kind: 'rbc' as const, rec, opts };
  });
  const [multi, setMulti] = useState<number[]>([]);

  if (task.kind === 'identify') {
    const correct = task.opts.indexOf(task.abo);
    return (
      <div className="mg center">
        <p className="prompt">{tr('Jaka to grupa krwi w układzie AB0?', 'Which ABO blood group is this?')} <span className="legend">▲ A · ■ B</span></p>
        <Erythrocyte abo={task.abo} />
        <ChoiceGrid columns={4} options={task.opts.map((o) => `${tr('Grupa', 'Group')} ${groupName(o)}`)} correct={correct}
          onAnswer={(i) => p.onDone({ success: i === correct, info: tr(`Grupa ${task.abo}: ${task.abo === '0' ? 'brak antygenów A i B' : task.abo === 'AB' ? 'antygeny A i B' : `antygen ${task.abo}`} na erytrocytach.`, `Group ${groupName(task.abo)}: ${task.abo === '0' ? 'no antigens A or B' : task.abo === 'AB' ? 'antigens A and B' : `antigen ${task.abo}`} on the erythrocytes.`) })} />
      </div>
    );
  }
  if (task.kind === 'rbc') {
    const correct = task.opts.findIndex((d) => rbcCompatible(d, task.rec));
    return (
      <div className="mg">
        <p className="prompt">{tr(<>Biorca: <b className="blood-tag">{label(task.rec)}</b> potrzebuje <b>koncentratu krwinek czerwonych</b>. Który dawca jest zgodny (AB0 i Rh)?</>, <>Recipient <b className="blood-tag">{label(task.rec)}</b> needs <b>red cell concentrate</b>. Which donor is compatible (ABO and Rh)?</>)}</p>
        <ChoiceGrid options={task.opts.map((d) => <span className="donor"><span className="blood-bag" aria-hidden>🩸</span> {label(d)}</span>)} correct={correct}
          onAnswer={(i) => p.onDone({ success: i === correct, info: tr(`Krwinki dawcy nie mogą mieć antygenów, przeciw którym biorca ${label(task.rec)} ma przeciwciała${task.rec.rh === '−' ? '; biorca Rh− otrzymuje krwinki Rh−' : ''}. W praktyce zawsze wykonuje się próbę zgodności.`, `The donor’s red cells must not carry antigens that the ${label(task.rec)} recipient has antibodies against${task.rec.rh === '−' ? '; an Rh− recipient gets Rh− red cells' : ''}. In practice a compatibility test (crossmatch) is always done.`) })} />
      </div>
    );
  }
  const toggle = (i: number) => setMulti((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]));
  const check = () => {
    const ok = task.opts.every((o, i) => plasmaCompatible(o, task.rec) === multi.includes(i));
    if (ok) sfx('pop');
    p.onDone({ success: ok, info: tr(`Osocze zawiera przeciwciała. Dla biorcy ${task.rec} zgodne osocze AB0: ${ABO_ALL.filter((d) => plasmaCompatible(d, task.rec)).join(', ')} (osocze AB nie ma anty-A ani anty-B).`, `Plasma contains antibodies. ABO-compatible plasma for a group ${groupName(task.rec)} recipient: ${ABO_ALL.filter((d) => plasmaCompatible(d, task.rec)).map(groupName).join(', ')} (group AB plasma has no anti-A or anti-B).`) });
  };
  return (
    <div className="mg">
      <p className="prompt">{tr(<>Biorca grupy <b className="blood-tag">{task.rec}</b> potrzebuje <b>osocza</b>. Zaznacz <b>wszystkich</b> zgodnych dawców (tylko układ AB0), potem „Gotowe”.</>, <>A group <b className="blood-tag">{groupName(task.rec)}</b> recipient needs <b>plasma</b>. Select <b>all</b> compatible donors (ABO only), then “Done”.</>)}</p>
      <div className="multi">
        {task.opts.map((o, i) => (
          <button key={i} className={`choice ${multi.includes(i) ? 'checked' : ''}`} onClick={() => toggle(i)} aria-pressed={multi.includes(i)}>
            <span className="kbd">{multi.includes(i) ? '✓' : i + 1}</span> 💧 {tr('Osocze grupy', 'Plasma, group')} {groupName(o)}
          </button>
        ))}
      </div>
      <button className="btn big primary" onClick={check}>{tr('Gotowe', 'Done')} ✓</button>
    </div>
  );
}
