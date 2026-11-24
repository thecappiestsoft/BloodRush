import { useEffect, useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { sample, shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { patientNames } from '../../data/content';
import { ChoiceGrid } from '../common/ChoiceGrid';
import { sfx } from '../../engine/sound';


/** Zapamiętaj grupy krwi pacjentów, potem przyporządkuj je do osób. */
export default function MemoryGroups(p: MiniGameProps) {
  const withRh = p.level !== 'primary';
  const ABO = tr(['A', 'B', 'AB', '0'], ['A', 'B', 'AB', 'O']);
  const ALL = ABO.flatMap((g) => [`${g} Rh+`, `${g} Rh−`]);
  const [task] = useState(() => {
    const n = lv(p.level, 3, 3, 4) + (p.intensity === 2 ? 1 : 0);
    const names = sample(p.rng, patientNames(), n);
    const groups = sample(p.rng, withRh ? ALL : ABO, n);
    const order = sample(p.rng, names.map((_, i) => i), lv(p.level, 2, 2, 3));
    const questions = order.map((i) => {
      const correct = groups[i];
      const pool = withRh
        ? [...new Set([...groups.filter((g) => g !== correct), correct.endsWith('+') ? correct.replace('+', '−') : correct.replace('−', '+'), ...sample(p.rng, ALL, 4)])].filter((g) => g !== correct)
        : ABO.filter((g) => g !== correct);
      const opts = shuffle(p.rng, [correct, ...pool.slice(0, 3)]);
      return { name: names[i], correct, opts };
    });
    return { names, groups, questions };
  });
  const [show, setShow] = useState(true);
  const [q, setQ] = useState(0);
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, (p.learn ? 5000 : 1800) + task.names.length * 650);
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = task.questions[q];
  return (
    <div className="mg center">
      {show ? (
        <>
          <p className="prompt">{tr(<><b>ZAPAMIĘTAJ</b> grupy krwi pacjentów!</>, <><b>REMEMBER</b> the patients’ blood groups!</>)}</p>
          <div className="patients">
            {task.names.map((n, i) => (
              <div key={n} className="patient-card">
                <span className="avatar" aria-hidden>{n[0]}</span>
                <b>{n}</b>
                <span className="blood-tag">{task.groups[i]}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="prompt">{tr('Jaką grupę krwi ma', 'What blood group does')} <b>{cur.name}</b> {tr('', 'have')}? <span className="muted">({q + 1}/{task.questions.length})</span></p>
          <ChoiceGrid key={q} options={cur.opts} correct={cur.opts.indexOf(cur.correct)} onAnswer={(i) => {
            if (cur.opts[i] !== cur.correct) return p.onDone({ success: false, info: tr(`${cur.name} ma grupę ${cur.correct}. ${withRh ? 'Układ AB0 i Rh są od siebie niezależne.' : 'Grupa krwi zależy od antygenów A i B na erytrocytach.'}`, `${cur.name} has group ${cur.correct}. ${withRh ? 'The ABO and Rh systems are independent of each other.' : 'The blood group depends on antigens A and B on the erythrocytes.'}`) });
            sfx('pop');
            if (q + 1 >= task.questions.length) p.onDone({ success: true, info: withRh ? tr('Zapis „A Rh−” łączy dwa niezależne układy: AB0 (antygeny A, B) i Rh (antygen D).', 'A label like “A Rh−” combines two independent systems: ABO (antigens A, B) and Rh (antigen D).') : tr('W układzie AB0 są cztery grupy: A, B, AB i 0.', 'The ABO system has four groups: A, B, AB and O.') });
            else setTimeout(() => setQ(q + 1), 250);
          }} />
        </>
      )}
    </div>
  );
}
