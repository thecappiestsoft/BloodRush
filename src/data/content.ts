import type { CellKind, Level } from '../types';
import { tr, getLang } from '../i18n';

/* ---------- Droga krwi (cykl) ---------- */
const CYCLE_SIMPLE_EN = [
  'Right atrium', 'Right ventricle', 'Pulmonary arteries', 'Lungs', 'Pulmonary veins',
  'Left atrium', 'Left ventricle', 'Aorta', 'Body organs', 'Venae cavae',
];
const CYCLE_FULL_EN = [
  'Right atrium', 'Right ventricle', 'Pulmonary trunk', 'Pulmonary arteries', 'Lung capillaries',
  'Pulmonary veins', 'Left atrium', 'Left ventricle', 'Aorta', 'Body arteries',
  'Tissue capillaries', 'Body veins', 'Venae cavae',
];
export const CYCLE_SIMPLE = [
  'Prawy przedsionek', 'Prawa komora', 'Tętnice płucne', 'Płuca', 'Żyły płucne',
  'Lewy przedsionek', 'Lewa komora', 'Aorta', 'Narządy ciała', 'Żyły główne',
];
export const CYCLE_FULL = [
  'Prawy przedsionek', 'Prawa komora', 'Pień płucny', 'Tętnice płucne', 'Naczynia włosowate płuc',
  'Żyły płucne', 'Lewy przedsionek', 'Lewa komora', 'Aorta', 'Tętnice ciała',
  'Naczynia włosowate tkanek', 'Żyły ciała', 'Żyły główne',
];
export const cycleFor = (l: Level) => (getLang() === 'en' ? (l === 'primary' ? CYCLE_SIMPLE_EN : CYCLE_FULL_EN) : l === 'primary' ? CYCLE_SIMPLE : CYCLE_FULL);
/** Fragment cyklu o długości k zaczynający się od indeksu start (z zawinięciem). */
export const cycleWindow = (cycle: string[], start: number, k: number) =>
  Array.from({ length: k }, (_, i) => cycle[(start + i) % cycle.length]);

/* ---------- Schemat serca (widok od przodu: prawa strona serca po LEWEJ stronie rysunku) ---------- */
export interface DiagramPart {
  id: string;
  readonly name: string;
  rect: { x: number; y: number; w: number; h: number };
  anchor: { x: number; y: number };
  kind: 'chamber' | 'vessel' | 'valve' | 'organ';
  side?: 'right' | 'left';
}
export const HEART_VIEW = { w: 400, h: 380 };
export const HEART_PARTS: DiagramPart[] = [
  { id: 'pp', get name() { return tr('Prawy przedsionek', 'Right atrium'); }, kind: 'chamber', side: 'right', rect: { x: 70, y: 123, w: 102, h: 84 }, anchor: { x: 118, y: 160 } },
  { id: 'pk', get name() { return tr('Prawa komora', 'Right ventricle'); }, kind: 'chamber', side: 'right', rect: { x: 95, y: 218, w: 112, h: 100 }, anchor: { x: 152, y: 262 } },
  { id: 'lp', get name() { return tr('Lewy przedsionek', 'Left atrium'); }, kind: 'chamber', side: 'left', rect: { x: 252, y: 128, w: 90, h: 64 }, anchor: { x: 298, y: 160 } },
  { id: 'lk', get name() { return tr('Lewa komora', 'Left ventricle'); }, kind: 'chamber', side: 'left', rect: { x: 240, y: 216, w: 82, h: 120 }, anchor: { x: 280, y: 268 } },
  { id: 'zgg', get name() { return tr('Żyła główna górna', 'Superior vena cava'); }, kind: 'vessel', side: 'right', rect: { x: 80, y: 8, w: 34, h: 110 }, anchor: { x: 97, y: 48 } },
  { id: 'zgd', get name() { return tr('Żyła główna dolna', 'Inferior vena cava'); }, kind: 'vessel', side: 'right', rect: { x: 52, y: 215, w: 40, h: 115 }, anchor: { x: 66, y: 292 } },
  { id: 'pien', get name() { return tr('Pień płucny', 'Pulmonary trunk'); }, kind: 'vessel', side: 'right', rect: { x: 168, y: 82, w: 34, h: 100 }, anchor: { x: 186, y: 140 } },
  { id: 'zp', get name() { return tr('Żyły płucne', 'Pulmonary veins'); }, kind: 'vessel', side: 'left', rect: { x: 340, y: 136, w: 52, h: 62 }, anchor: { x: 366, y: 166 } },
  { id: 'aorta', get name() { return tr('Aorta', 'Aorta'); }, kind: 'vessel', side: 'left', rect: { x: 222, y: 28, w: 104, h: 44 }, anchor: { x: 272, y: 52 } },
  { id: 'z3', get name() { return tr('Zastawka trójdzielna', 'Tricuspid valve'); }, kind: 'valve', side: 'right', rect: { x: 100, y: 206, w: 48, h: 12 }, anchor: { x: 124, y: 212 } },
  { id: 'z2', get name() { return tr('Zastawka dwudzielna', 'Bicuspid (mitral) valve'); }, kind: 'valve', side: 'left', rect: { x: 266, y: 200, w: 46, h: 12 }, anchor: { x: 289, y: 206 } },
  { id: 'zpp', get name() { return tr('Zastawka pnia płucnego', 'Pulmonary valve'); }, kind: 'valve', side: 'right', rect: { x: 172, y: 192, w: 28, h: 10 }, anchor: { x: 186, y: 197 } },
  { id: 'za', get name() { return tr('Zastawka aorty', 'Aortic valve'); }, kind: 'valve', side: 'left', rect: { x: 222, y: 196, w: 28, h: 10 }, anchor: { x: 236, y: 201 } },
];
export const heartPart = (id: string) => HEART_PARTS.find((p) => p.id === id)!;
export function heartPartsFor(level: Level) {
  const chambers = ['pp', 'pk', 'lp', 'lk'];
  if (level === 'primary') return [...chambers, 'aorta', 'zgg'];
  if (level === 'highschool') return [...chambers, 'aorta', 'pien', 'zp', 'zgg', 'zgd'];
  return HEART_PARTS.map((p) => p.id);
}

/* ---------- Schemat krążenia ---------- */
export const CIRC_VIEW = { w: 400, h: 420 };
export const CIRC_PARTS: DiagramPart[] = [
  { id: 'pluca', get name() { return tr('Płuca', 'Lungs'); }, kind: 'organ', rect: { x: 120, y: 16, w: 160, h: 80 }, anchor: { x: 200, y: 82 } },
  { id: 'cialo', get name() { return tr('Narządy ciała', 'Body organs'); }, kind: 'organ', rect: { x: 120, y: 340, w: 160, h: 70 }, anchor: { x: 200, y: 382 } },
  { id: 'ps', get name() { return tr('Prawa połowa serca', 'Right side of the heart'); }, kind: 'chamber', side: 'right', rect: { x: 122, y: 170, w: 74, h: 90 }, anchor: { x: 159, y: 215 } },
  { id: 'ls', get name() { return tr('Lewa połowa serca', 'Left side of the heart'); }, kind: 'chamber', side: 'left', rect: { x: 204, y: 170, w: 74, h: 90 }, anchor: { x: 241, y: 215 } },
  { id: 'tp', get name() { return tr('Tętnice płucne', 'Pulmonary arteries'); }, kind: 'vessel', rect: { x: 50, y: 40, w: 30, h: 180 }, anchor: { x: 64, y: 125 } },
  { id: 'zp', get name() { return tr('Żyły płucne', 'Pulmonary veins'); }, kind: 'vessel', rect: { x: 320, y: 40, w: 30, h: 180 }, anchor: { x: 336, y: 125 } },
  { id: 'ao', get name() { return tr('Aorta', 'Aorta'); }, kind: 'vessel', rect: { x: 230, y: 260, w: 30, h: 88 }, anchor: { x: 312, y: 305 } },
  { id: 'zg', get name() { return tr('Żyły główne', 'Venae cavae'); }, kind: 'vessel', rect: { x: 140, y: 260, w: 30, h: 88 }, anchor: { x: 88, y: 305 } },
];
export function circPartsFor(level: Level) {
  if (level === 'primary') return ['pluca', 'cialo', 'ao', 'zg'];
  if (level === 'highschool') return ['pluca', 'cialo', 'ao', 'zg', 'tp', 'zp'];
  return CIRC_PARTS.map((p) => p.id);
}

/* ---------- Opisy komórek ---------- */
const T2 = (pl: string, en: string) => ({ get v() { return tr(pl, en); } });
type Txt = { readonly v: string };

const CD = (kind: CellKind, levels: Level[], text: Txt, fact: Txt) => ({ kind, levels, get text() { return text.v; }, get fact() { return fact.v; } });
const ALL: Level[] = ['primary', 'highschool', 'technical'];
export const CELL_DESCRIPTIONS: { kind: CellKind; readonly text: string; levels: Level[]; readonly fact: string }[] = [
  CD('rbc', ALL, T2('Krwinka bez jądra w kształcie dwuwklęsłego krążka', 'A cell with no nucleus, shaped like a biconcave disc'), T2('Erytrocyt nie ma jądra, a jego dwuwklęsły kształt zwiększa powierzchnię wymiany gazowej.', 'An erythrocyte has no nucleus, and its biconcave shape increases the surface area for gas exchange.')),
  CD('platelet', ALL, T2('Najmniejszy element krwi – drobny fragment komórki bez jądra', 'The smallest blood element – a tiny cell fragment with no nucleus'), T2('Trombocyty to fragmenty megakariocytów – najmniejsze elementy morfotyczne.', 'Thrombocytes are fragments of megakaryocytes – the smallest formed elements.')),
  CD('neutrophil', ['primary'], T2('Krwinka z jądrem, która broni organizmu przed bakteriami', 'A blood cell with a nucleus that defends the body against bacteria'), T2('Leukocyty mają jądro komórkowe i bronią organizmu.', 'Leukocytes have a nucleus and defend the body.')),
  CD('neutrophil', ['highschool', 'technical'], T2('Leukocyt z jądrem podzielonym na kilka płatów', 'A leukocyte with a nucleus divided into several lobes'), T2('Neutrofil ma jądro z 2–5 płatów; fagocytuje bakterie.', 'A neutrophil has a nucleus with 2–5 lobes; it phagocytoses bacteria.')),
  CD('lymphocyte', ['highschool', 'technical'], T2('Niewielki leukocyt z dużym, okrągłym jądrem wypełniającym prawie całą komórkę', 'A small leukocyte with a large, round nucleus filling almost the whole cell'), T2('Limfocyt ma duże okrągłe jądro i wąski rąbek cytoplazmy.', 'A lymphocyte has a large round nucleus and a thin rim of cytoplasm.')),
  CD('monocyte', ['highschool', 'technical'], T2('Największy leukocyt z jądrem w kształcie nerki', 'The largest leukocyte, with a kidney-shaped nucleus'), T2('Monocyt to największy leukocyt; w tkankach staje się makrofagiem.', 'The monocyte is the largest leukocyte; in tissues it becomes a macrophage.')),
  CD('eosinophil', ['technical'], T2('Leukocyt z dwupłatowym jądrem i licznymi pomarańczowymi ziarnistościami', 'A leukocyte with a two-lobed nucleus and many orange granules'), T2('Eozynofil ma ziarnistości barwiące się eozyną na pomarańczowo-czerwono.', 'An eosinophil has granules that stain orange-red with eosin.')),
];

/* ---------- Kryteria porządkowania ---------- */
const OC = (levels: Level[], prompt: Txt, itemsPl: string[], itemsEn: string[], fact: Txt, cells?: CellKind[]) =>
  ({ levels, cells, get prompt() { return prompt.v; }, get items() { return tr(itemsPl, itemsEn); }, get fact() { return fact.v; } });
export const ORDER_CRITERIA: { readonly prompt: string; readonly items: string[]; levels: Level[]; cells?: CellKind[]; readonly fact: string }[] = [
  OC(['primary'], T2('Od NAJMNIEJSZEGO do największego', 'From SMALLEST to largest'), ['Trombocyt', 'Erytrocyt', 'Leukocyt'], ['Thrombocyte', 'Erythrocyte', 'Leukocyte'], T2('Trombocyty (2–4 µm) < erytrocyty (ok. 7–8 µm) < większość leukocytów (ok. 10–20 µm).', 'Thrombocytes (2–4 µm) < erythrocytes (about 7–8 µm) < most leukocytes (about 10–20 µm).'), ['platelet', 'rbc', 'neutrophil']),
  OC(ALL, T2('Od NAJLICZNIEJSZYCH we krwi do najmniej licznych', 'From MOST numerous in blood to least numerous'), ['Erytrocyty', 'Trombocyty', 'Leukocyty'], ['Erythrocytes', 'Thrombocytes', 'Leukocytes'], T2('Erytrocytów jest najwięcej, potem płytek krwi, a najmniej leukocytów.', 'Erythrocytes are the most numerous, then platelets, and leukocytes are the fewest.')),
  OC(['highschool', 'technical'], T2('Od NAJMNIEJSZEGO do największego', 'From SMALLEST to largest'), ['Trombocyt', 'Erytrocyt', 'Neutrofil', 'Monocyt'], ['Thrombocyte', 'Erythrocyte', 'Neutrophil', 'Monocyte'], T2('Trombocyt < erytrocyt < neutrofil < monocyt (największy leukocyt).', 'Thrombocyte < erythrocyte < neutrophil < monocyte (the largest leukocyte).'), ['platelet', 'rbc', 'neutrophil', 'monocyte']),
  OC(['highschool', 'technical'], T2('Od NAJWYŻSZEGO ciśnienia krwi do najniższego', 'From HIGHEST blood pressure to lowest'), ['Aorta', 'Tętnice', 'Naczynia włosowate', 'Żyły', 'Żyły główne'], ['Aorta', 'Arteries', 'Capillaries', 'Veins', 'Venae cavae'], T2('Ciśnienie spada wraz z oddalaniem się od lewej komory – najniższe jest w żyłach głównych.', 'Pressure falls with distance from the left ventricle – it is lowest in the venae cavae.')),
  OC(['highschool', 'technical'], T2('Etapy hemostazy (w uproszczeniu) – po kolei', 'Stages of haemostasis (simplified) – in order'), ['Skurcz naczynia', 'Przyleganie płytek do rany', 'Czop płytkowy', 'Sieć włóknika (skrzep)'], ['Vessel constriction', 'Platelets stick to the wound', 'Platelet plug', 'Fibrin mesh (clot)'], T2('Skurcz naczynia → czop płytkowy → krzepnięcie (fibrynogen → włóknik) wzmacniające czop.', 'Vessel constriction → platelet plug → clotting (fibrinogen → fibrin) that strengthens the plug.')),
  OC(['technical'], T2('Powstawanie erytrocytu – po kolei', 'Making an erythrocyte – in order'), ['Komórka macierzysta szpiku', 'Erytroblast (z jądrem)', 'Retikulocyt', 'Erytrocyt'], ['Bone marrow stem cell', 'Erythroblast (with nucleus)', 'Reticulocyte', 'Erythrocyte'], T2('W czerwonym szpiku erytroblasty tracą jądro; młode krwinki to retikulocyty.', 'In red bone marrow, erythroblasts lose their nucleus; young red cells are reticulocytes.')),
  OC(ALL, T2('Droga tlenu – po kolei', 'The path of oxygen – in order'), ['Pęcherzyki płucne', 'Naczynia włosowate płuc', 'Hemoglobina w erytrocycie', 'Komórki tkanek'], ['Alveoli', 'Lung capillaries', 'Haemoglobin in an erythrocyte', 'Tissue cells'], T2('Tlen dyfunduje z pęcherzyków do krwi, wiąże go hemoglobina, a w tkankach jest oddawany.', 'Oxygen diffuses from the alveoli into the blood, is bound by haemoglobin and released in the tissues.')),
];

const NAMES_PL = ['Ania', 'Bartek', 'Celina', 'Darek', 'Ewa', 'Filip', 'Gosia', 'Hubert', 'Iga', 'Janek', 'Kasia', 'Leon', 'Maja', 'Nikodem', 'Ola', 'Piotr'];
const NAMES_EN = ['Amy', 'Ben', 'Chloe', 'Dan', 'Emma', 'Finn', 'Grace', 'Harry', 'Isla', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Sam'];
export const patientNames = () => tr(NAMES_PL, NAMES_EN);
