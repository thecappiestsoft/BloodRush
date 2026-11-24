import { useState } from 'react';
import { tr } from '../../i18n';
import type { MiniGameProps } from '../../types';
import { sample } from '../../utils/random';
import { CIRC_PARTS, CIRC_VIEW, circPartsFor } from '../../data/content';
import { SlotDiagram } from '../common/SlotDiagram';
import { CircSvg } from '../common/Diagrams';

/** Zbuduj układ krwionośny: umieść elementy na schemacie krążenia. */
export default function BuildCirculation(p: MiniGameProps) {
  const [parts] = useState(() => {
    const ids = circPartsFor(p.level);
    const chosen = p.intensity === 0 && ids.length > 4 ? sample(p.rng, ids, ids.length - 1) : ids;
    return CIRC_PARTS.filter((x) => chosen.includes(x.id));
  });
  const extra = p.level === 'primary' ? [] : [tr('Tchawica', 'Trachea')];
  return (
    <div className="mg">
      <p className="prompt">{tr('Umieść elementy na schemacie krążenia.', 'Place the parts on the circulation diagram.')} <span className="muted">{tr('Kolor czerwony – krew utlenowana, niebieski – odtlenowana.', 'Red – oxygenated blood, blue – deoxygenated.')}</span></p>
      <SlotDiagram p={p} parts={parts} view={CIRC_VIEW} svg={<CircSvg />} allowed={1} extraLabels={extra}
        successInfo={tr('Krążenie małe: prawa komora → tętnice płucne → płuca → żyły płucne → lewy przedsionek. Krążenie duże: lewa komora → aorta → narządy → żyły główne → prawy przedsionek.', 'Pulmonary circuit: right ventricle → pulmonary arteries → lungs → pulmonary veins → left atrium. Systemic circuit: left ventricle → aorta → organs → venae cavae → right atrium.')} />
    </div>
  );
}
