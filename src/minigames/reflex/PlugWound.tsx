import { useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { shuffle } from '../../utils/random';
import { lv } from '../../utils/level';
import { Cell } from '../common/Cell';
import { useDragTap } from '../common/useDragTap';
import { useMistakes } from '../common/hooks';
import { sfx } from '../../engine/sound';

type Token = { id: string; kind: 'plt' | 'rbc' | 'wbc' | 'fib' | 'vaso'; label: string };

/** Zatkaj ranę: zbuduj czop płytkowy (a w wyższych poziomach – pełną hemostazę). */
export default function PlugWound(p: MiniGameProps) {
  const needVaso = p.level === 'technical';
  const needFib = p.level !== 'primary';
  const nPlt = lv(p.level, 3, 3, 3) + (p.intensity === 2 ? 1 : 0);
  const [tokens] = useState<Token[]>(() => shuffle(p.rng, [
    ...Array.from({ length: nPlt }, (_, i) => ({ id: `plt${i}`, kind: 'plt' as const, label: tr('Trombocyt', 'Thrombocyte') })),
    { id: 'rbc0', kind: 'rbc', label: tr('Erytrocyt', 'Erythrocyte') },
    { id: 'wbc0', kind: 'wbc', label: tr('Leukocyt', 'Leukocyte') },
    ...(p.level !== 'primary' ? [{ id: 'rbc1', kind: 'rbc' as const, label: tr('Erytrocyt', 'Erythrocyte') }] : []),
    ...(needFib ? [{ id: 'fib', kind: 'fib' as const, label: tr('Nici włóknika', 'Fibrin threads') }] : []),
    ...(needVaso ? [{ id: 'vaso', kind: 'vaso' as const, label: tr('Skurcz naczynia', 'Vessel constriction') }] : []),
  ]));
  const [used, setUsed] = useState<string[]>([]);
  const mistake = useMistakes(p, 1);
  const plts = used.filter((u) => u.startsWith('plt')).length;
  const vasoDone = used.includes('vaso');
  const fibDone = used.includes('fib');

  const { itemProps, targetProps, selected, ghost } = useDragTap((id) => {
    const t = tokens.find((x) => x.id === id)!;
    if (used.includes(id)) return;
    const fail = (msg: string) => mistake(msg);
    if (t.kind === 'rbc' || t.kind === 'wbc') return fail(tr(`${t.label} nie tworzy czopu – czop płytkowy budują trombocyty.`, `An ${t.label.toLowerCase()} does not form a plug – the platelet plug is built by thrombocytes.`));
    if (needVaso && !vasoDone && t.kind !== 'vaso') return fail(tr('Pierwsza reakcja to skurcz uszkodzonego naczynia – zmniejsza wypływ krwi.', 'The first response is constriction of the damaged vessel – it reduces blood loss.'));
    if (t.kind === 'fib' && plts < nPlt) return fail(tr('Najpierw czop płytkowy, potem sieć włóknika go wzmacnia.', 'Platelet plug first – then the fibrin mesh strengthens it.'));
    sfx('pop');
    const next = [...used, id];
    setUsed(next);
    const p2 = next.filter((u) => u.startsWith('plt')).length;
    if (p2 >= nPlt && (!needFib || next.includes('fib')) && (!needVaso || next.includes('vaso'))) {
      p.onDone({
        success: true,
        info: lv(p.level,
          tr('Trombocyty przylegają do rany i sklejają się, tworząc czop płytkowy.', 'Thrombocytes stick to the wound and to each other, forming a platelet plug.'),
          tr('Czop płytkowy wzmacnia sieć włóknika powstająca z fibrynogenu – to krzepnięcie, część hemostazy.', 'The platelet plug is strengthened by a fibrin mesh made from fibrinogen – this is clotting, part of haemostasis.'),
          tr('Hemostaza: skurcz naczynia → czop płytkowy → krzepnięcie (fibrynogen → włóknik).', 'Haemostasis: vessel constriction → platelet plug → clotting (fibrinogen → fibrin).')),
      });
    }
  });

  const iconFor = (k: Token['kind']) =>
    k === 'plt' ? <Cell kind="platelet" size={34} /> : k === 'rbc' ? <Cell kind="rbc" size={34} /> : k === 'wbc' ? <Cell kind={'neutrophil' as CellKind} size={34} /> : k === 'fib' ? <span className="tok-ico">〰️</span> : <span className="tok-ico">↔️</span>;

  return (
    <div className="mg">
      <p className="prompt">
        {tr(lv(p.level, <>Przeciągnij <b>trombocyty</b> do rany, aby utworzyć czop płytkowy.</>, <>Zbuduj <b>czop płytkowy</b>, a potem wzmocnij go <b>włóknikiem</b>.</>, <>Hemostaza po kolei: <b>skurcz naczynia</b> → <b>czop płytkowy</b> → <b>włóknik</b>.</>), lv(p.level, <>Drag <b>thrombocytes</b> into the wound to build a platelet plug.</>, <>Build a <b>platelet plug</b>, then strengthen it with <b>fibrin</b>.</>, <>Haemostasis in order: <b>vessel constriction</b> → <b>platelet plug</b> → <b>fibrin</b>.</>))}
      </p>
      <div className={`vessel ${vasoDone ? 'constricted' : ''}`}>
        <div className="vessel-flow" aria-hidden />
        <button className={`wound ${selected ? 'armed' : ''} ${plts >= nPlt ? 'sealed' : ''}`} {...targetProps('wound')} aria-label={tr('Rana w ścianie naczynia – upuść tutaj', 'Wound in the vessel wall – drop here')}>
          <span className="wound-label">{plts >= nPlt && (!needFib || fibDone) ? tr('ZAMKNIĘTA', 'SEALED') : tr('RANA', 'WOUND')}</span>
          <span className="wound-fill">
            {Array.from({ length: plts }, (_, i) => <Cell key={i} kind="platelet" size={26} />)}
          </span>
          {fibDone && <span className="fibrin" aria-hidden />}
        </button>
        <div className="progress-dots" aria-live="polite">{tr('Płytki', 'Platelets')}: {plts}/{nPlt}{needFib ? ` · ${tr('włóknik', 'fibrin')}: ${fibDone ? '✓' : '—'}` : ''}{needVaso ? ` · ${tr('skurcz', 'constriction')}: ${vasoDone ? '✓' : '—'}` : ''}</div>
      </div>
      <div className="tray">
        {tokens.filter((t) => !used.includes(t.id)).map((t) => (
          <button key={t.id} className={`chip token ${selected === t.id ? 'selected' : ''}`} {...itemProps(t.id)}>
            {iconFor(t.kind)} {t.label}
          </button>
        ))}
      </div>
      {ghost((id) => { const t = tokens.find((x) => x.id === id)!; return <span className="chip token">{iconFor(t.kind)} {t.label}</span>; })}
    </div>
  );
}
