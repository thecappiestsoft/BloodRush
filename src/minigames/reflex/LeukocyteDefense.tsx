import { useState } from 'react';
import { tr } from '../../i18n';
import type { CellKind, MiniGameProps } from '../../types';
import { pick } from '../../utils/random';
import { lv } from '../../utils/level';
import { CatchField } from '../common/CatchField';
import { CELL_NAMES } from '../common/Cell';

/** Uciekające bakterie: aktywuj krwinki obronne – każda „zjada” najbliższą bakterię. */
export default function LeukocyteDefense(p: MiniGameProps) {
  const phago = p.level !== 'primary';
  const [cfg] = useState(() => {
    const n = lv(p.level, 3, 4, 4) + (p.intensity === 2 ? 1 : 0);
    const targets: CellKind[] = Array.from({ length: n }, () => (phago ? pick(p.rng, ['neutrophil', 'monocyte'] as CellKind[]) : pick(p.rng, ['neutrophil', 'lymphocyte', 'monocyte'] as CellKind[])));
    const distractors: CellKind[] = [
      ...Array<CellKind>(n + 1).fill('bacterium'),
      ...Array.from({ length: lv(p.level, 2, 3, 4) }, () => (phago ? pick(p.rng, ['rbc', 'lymphocyte', 'lymphocyte'] as CellKind[]) : 'rbc' as CellKind)),
    ];
    return { targets, distractors };
  });
  return (
    <div className="mg">
      <p className="prompt">
        {phago ? tr(<>Aktywuj <b>fagocyty</b> (neutrofile i monocyty) – każdy pochłonie bakterię!</>, <>Activate the <b>phagocytes</b> (neutrophils and monocytes) – each one will engulf a bacterium!</>) : tr(<>Kliknij <b>leukocyty</b> (krwinki z jądrem) – każdy pochłonie bakterię!</>, <>Click the <b>leukocytes</b> (cells with a nucleus) – each one will engulf a bacterium!</>)}
      </p>
      <CatchField p={p} targets={cfg.targets} distractors={cfg.distractors} speed={lv(p.level, 3.5, 5, 6.5)} allowed={1}
        successInfo={phago ? tr('Neutrofile i monocyty (makrofagi) fagocytują drobnoustroje. Limfocyty działają inaczej – np. wytwarzają przeciwciała.', 'Neutrophils and monocytes (macrophages) phagocytose microbes. Lymphocytes work differently – e.g. they make antibodies.') : tr('Leukocyty bronią organizmu – niektóre pochłaniają bakterie (fagocytoza).', 'Leukocytes defend the body – some of them engulf bacteria (phagocytosis).')}
        wrongInfo={(k) => k === 'bacterium' ? tr('To bakteria – kliknij krwinkę obronną, a ona sama ją pochłonie.', 'That is a bacterium – click a defending cell and it will engulf it.') : k === 'lymphocyte' ? tr('Limfocyt nie jest typowym fagocytem – odpowiada za odporność swoistą.', 'A lymphocyte is not a typical phagocyte – it is responsible for specific immunity.') : tr(`To ${CELL_NAMES[k]} – nie zwalcza bakterii.`, `That is a ${CELL_NAMES[k]} – it does not fight bacteria.`)}
        onTargetHit={(hit, items) => {
          let best: (typeof items)[number] | null = null;
          let bd = Infinity;
          for (const it of items) {
            if (it.kind !== 'bacterium' || it.state !== 'alive') continue;
            const d = Math.hypot(it.x - hit.x, it.y - hit.y);
            if (d < bd) { bd = d; best = it; }
          }
          if (best) best.state = 'popped';
        }} />
    </div>
  );
}
