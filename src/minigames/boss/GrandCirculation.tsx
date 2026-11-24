import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps, MiniGameResult } from '../../types';
import BloodPath from '../logic/BloodPath';
import Donor from '../math/Donor';
import CatchErythrocytes from '../reflex/CatchErythrocytes';
import PlugWound from '../reflex/PlugWound';

const st = (pl: string, en: string, C: typeof BloodPath) => ({ get name() { return tr(pl, en); }, C });
const STAGES = [
  st('Etap 1/4: Droga krwi', 'Stage 1/4: Blood path', BloodPath),
  st('Etap 2/4: Złap erytrocyty', 'Stage 2/4: Catch the erythrocytes', CatchErythrocytes),
  st('Etap 3/4: Zatamuj krwawienie', 'Stage 3/4: Stop the bleeding', PlugWound),
  st('Etap 4/4: Transfuzja', 'Stage 4/4: Transfusion', Donor),
];

/** Finał Boss Rush – „Wielki Krwiobieg” łączy kilka mechanik w jednym zadaniu. */
export default function GrandCirculation(p: MiniGameProps) {
  const [stage, setStage] = useState(0);
  const S = STAGES[stage];
  const child: MiniGameProps = {
    ...p,
    intensity: 1,
    onDone: (r: MiniGameResult) => {
      if (!r.success) return p.onDone({ success: false, info: `${tr('Awaria na etapie', 'Failure at stage')} ${stage + 1}. ${r.info ?? ''}` });
      if (stage + 1 >= STAGES.length) p.onDone({ success: true, info: tr('WIELKI KRWIOBIEG URATOWANY! Przepływ, transport tlenu, hemostaza i zgodność krwi – wszystko działa.', 'THE GREAT CIRCULATION IS SAVED! Flow, oxygen transport, haemostasis and blood compatibility – everything works.') });
      else setStage(stage + 1);
    },
  };
  return (
    <div className="mg boss">
      <div className="boss-bar">
        {STAGES.map((s, i) => <span key={i} className={i < stage ? 'done' : i === stage ? 'now' : ''}>{i + 1}</span>)}
        <b>{S.name}</b>
      </div>
      <S.C key={stage} {...child} />
    </div>
  );
}
