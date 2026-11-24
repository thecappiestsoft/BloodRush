import { groupName } from '../i18n';
/** Zasady zgodności (uproszczone, dydaktyczne) – zależne od przetaczanego składnika. */
export type ABO = 'A' | 'B' | 'AB' | '0';
export interface BloodType { abo: ABO; rh: '+' | '−' }
export const ABO_ALL: ABO[] = ['A', 'B', 'AB', '0'];
export const label = (t: BloodType) => `${groupName(t.abo)} Rh${t.rh}`;
const antigens = (a: ABO) => (a === 'AB' ? ['A', 'B'] : a === '0' ? [] : [a]);

/** Koncentrat krwinek czerwonych: krwinki dawcy nie mogą mieć antygenów, przeciw którym biorca ma przeciwciała; Rh− biorca → Rh− dawca. */
export function rbcCompatible(donor: BloodType, recipient: BloodType, useRh = true) {
  const ok = antigens(donor.abo).every((ag) => antigens(recipient.abo).includes(ag));
  return ok && (!useRh || recipient.rh === '+' || donor.rh === '−');
}
/** Osocze: przeciwciała w osoczu dawcy nie mogą reagować z antygenami biorcy (uwzględniamy tylko AB0). */
export function plasmaCompatible(donor: ABO, recipient: ABO) {
  return antigens(recipient).every((ag) => antigens(donor).includes(ag));
}
