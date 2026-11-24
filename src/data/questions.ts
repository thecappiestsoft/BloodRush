import { tr } from '../i18n';
import type { BankItem, Category, Level, OddItem, PairItem, QuizItem, SortItem, TFItem } from '../types';

/* Skróty poziomów: P – podstawówka, H – liceum, T – technikum */
export const L = (s: string): Level[] =>
  [...s].map((c) => (c === 'P' ? 'primary' : c === 'H' ? 'highschool' : 'technical'));

let n = 0;
const id = (p: string) => `${p}-${String(++n).padStart(3, '0')}`;

const tf = (lv: string, category: Category, statement: string, answer: boolean, explanation: string): TFItem =>
  ({ id: id('tf'), type: 'tf', levels: L(lv), category, statement, answer, explanation });
const odd = (lv: string, category: Category, others: string[], oddOne: string, explanation: string): OddItem =>
  ({ id: id('odd'), type: 'odd', levels: L(lv), category, others, odd: oddOne, explanation });
const pair = (lv: string, category: Category, group: string, left: string, right: string, explanation: string): PairItem =>
  ({ id: id('pair'), type: 'pair', levels: L(lv), category, group, left, right, explanation });
const sort = (lv: string, category: Category, set: string, item: string, bin: string, explanation: string): SortItem =>
  ({ id: id('sort'), type: 'sort', levels: L(lv), category, set, item, bin, explanation });
const quiz = (lv: string, category: Category, question: string, correct: string, wrong: string[], explanation: string): QuizItem =>
  ({ id: id('quiz'), type: 'quiz', levels: L(lv), category, question, correct, wrong, explanation });

const S = (pl: string, en: string, binsPl: string[], binsEn: string[]) => ({ get name() { return tr(pl, en); }, get bins() { return tr(binsPl, binsEn); } });
export const SORT_SETS: Record<string, { readonly name: string; readonly bins: string[] }> = {
  plasma: S('Sortowanie krwi', 'Blood sorting', ['Osocze', 'Elementy morfotyczne'], ['Plasma', 'Formed elements']),
  vessels: S('Tętnica czy żyła?', 'Artery or vein?', ['Tętnice', 'Żyły', 'Naczynia włosowate'], ['Arteries', 'Veins', 'Capillaries']),
  cellfunc: S('Posortuj funkcje', 'Sort the functions', ['Erytrocyty', 'Leukocyty', 'Trombocyty'], ['Erythrocytes', 'Leukocytes', 'Thrombocytes']),
};
const PG: Record<string, [string, string]> = {
  cells: ['Elementy krwi i ich funkcje', 'Blood components and their functions'],
  heart: ['Części serca i ich funkcje', 'Parts of the heart and their functions'],
  vessels: ['Naczynia i ich funkcje', 'Vessels and their functions'],
  immune: ['Rodzaje leukocytów', 'Types of leukocytes'],
  proteins: ['Białka osocza', 'Plasma proteins'],
  morphology: ['Parametry morfologii', 'Blood count parameters'],
};
export const PAIR_GROUPS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_, k: string) => (PG[k] ? tr(PG[k][0], PG[k][1]) : undefined),
  ownKeys: () => Object.keys(PG),
  getOwnPropertyDescriptor: (_, k: string) => (PG[k] ? { enumerable: true, configurable: true, value: tr(PG[k][0], PG[k][1]) } : undefined),
});

export const DEFAULT_BANK: BankItem[] = [
  /* ===================== PRAWDA / FAŁSZ ===================== */
  tf('PHT', 'erytrocyty', 'Erytrocyty transportują tlen dzięki hemoglobinie.', true, 'Hemoglobina w erytrocytach wiąże tlen w płucach i oddaje go w tkankach.'),
  tf('PHT', 'erytrocyty', 'Dojrzałe erytrocyty człowieka mają jądro komórkowe.', false, 'Dojrzałe erytrocyty człowieka nie mają jądra – mieszczą więcej hemoglobiny.'),
  tf('PHT', 'leukocyty', 'Leukocyty biorą udział w obronie organizmu.', true, 'Leukocyty (krwinki białe) niszczą drobnoustroje i uczestniczą w odpowiedzi immunologicznej.'),
  tf('PHT', 'trombocyty', 'Trombocyty uczestniczą w tamowaniu krwawienia.', true, 'Płytki krwi tworzą czop płytkowy i uczestniczą w hemostazie.'),
  tf('PH', 'trombocyty', 'Płytki krwi są największymi elementami morfotycznymi krwi.', false, 'Trombocyty to najmniejsze elementy morfotyczne – drobne fragmenty komórek.'),
  tf('HT', 'trombocyty', 'Trombocyty to pełne komórki z dużym jądrem.', false, 'Trombocyty to bezjądrowe fragmenty cytoplazmy dużych komórek szpiku – megakariocytów.'),
  tf('PHT', 'osocze', 'Osocze to płynna część krwi.', true, 'Osocze to płynna część krwi, w której zawieszone są elementy morfotyczne.'),
  tf('PHT', 'sklad', 'Osocze stanowi mniej niż 10% objętości krwi.', false, 'Osocze stanowi ok. 55% objętości krwi.'),
  tf('PHT', 'osocze', 'Osocze składa się w około 90% z wody.', true, 'Woda to ok. 90% osocza; resztę stanowią m.in. białka, sole mineralne, glukoza i hormony.'),
  tf('PHT', 'serce', 'Serce człowieka ma cztery jamy: dwa przedsionki i dwie komory.', true, 'Serce człowieka ma dwa przedsionki i dwie komory.'),
  tf('PHT', 'serce', 'Ściana lewej komory jest grubsza niż ściana prawej komory.', true, 'Lewa komora tłoczy krew do całego ciała, więc ma grubszą ścianę mięśniową.'),
  tf('PHT', 'serce', 'Zastawki w sercu zapobiegają cofaniu się krwi.', true, 'Zastawki zapewniają jednokierunkowy przepływ krwi.'),
  tf('HT', 'serce', 'Zastawka trójdzielna leży między lewym przedsionkiem a lewą komorą.', false, 'Trójdzielna leży po prawej stronie serca; po lewej jest zastawka dwudzielna (mitralna).'),
  tf('PHT', 'naczynia', 'Tętnice prowadzą krew od serca.', true, 'Tętnice odprowadzają krew z serca – niezależnie od stopnia jej utlenowania.'),
  tf('PHT', 'naczynia', 'Żyły zawsze prowadzą krew odtlenowaną.', false, 'Żyły płucne prowadzą krew utlenowaną z płuc do lewego przedsionka.'),
  tf('PHT', 'naczynia', 'Tętnicami zawsze płynie krew utlenowana.', false, 'Pień płucny i tętnice płucne prowadzą krew odtlenowaną do płuc.'),
  tf('PHT', 'naczynia', 'W naczyniach włosowatych zachodzi wymiana substancji między krwią a tkankami.', true, 'Cienka ściana naczyń włosowatych umożliwia wymianę gazów i substancji.'),
  tf('PHT', 'naczynia', 'Ściany tętnic są grubsze i bardziej sprężyste niż ściany żył.', true, 'Tętnice wytrzymują wysokie ciśnienie krwi wypychanej z serca.'),
  tf('HT', 'naczynia', 'Żyły kończyn mają zastawki, które ułatwiają przepływ krwi w kierunku serca.', true, 'Zastawki żylne zapobiegają cofaniu się krwi.'),
  tf('HT', 'naczynia', 'Ściana naczynia włosowatego zbudowana jest z jednej warstwy komórek śródbłonka.', true, 'Tak cienka ściana ułatwia dyfuzję gazów i substancji.'),
  tf('PHT', 'krazenie-male', 'Krążenie płucne zaczyna się w prawej komorze.', true, 'Krążenie małe: prawa komora → płuca → lewy przedsionek.'),
  tf('PHT', 'krazenie-male', 'Krew z płuc wraca do lewego przedsionka.', true, 'Żyły płucne uchodzą do lewego przedsionka.'),
  tf('PHT', 'krazenie-duze', 'Krążenie duże zaczyna się w lewej komorze.', true, 'Krążenie duże: lewa komora → aorta → ciało → prawy przedsionek.'),
  tf('PHT', 'krazenie-duze', 'Krążenie duże kończy się w lewym przedsionku.', false, 'Krążenie duże kończy się w prawym przedsionku (żyły główne).'),
  tf('PHT', 'grupy', 'Grupę krwi w układzie AB0 określa obecność antygenów A i B na erytrocytach.', true, 'Grupa zależy od obecności lub braku antygenów A i B na erytrocytach.'),
  tf('PHT', 'grupy', 'Osoba z grupą krwi 0 ma na erytrocytach antygeny A i B.', false, 'Erytrocyty grupy 0 nie mają antygenów A ani B.'),
  tf('PHT', 'grupy', 'Osoba z grupą AB ma na erytrocytach antygeny A i B.', true, 'Grupa AB = oba antygeny: A i B.'),
  tf('PHT', 'rh', 'Czynnik Rh (antygen D) może występować na powierzchni erytrocytów.', true, 'Osoby Rh+ mają antygen D na erytrocytach, osoby Rh− go nie mają.'),
  tf('PHT', 'rh', 'Czynnik Rh zależy od grupy krwi w układzie AB0.', false, 'Układ Rh jest niezależny od AB0 – np. ktoś może mieć grupę A Rh+ albo A Rh−.'),
  tf('HT', 'grupy', 'Grupa 0 jest uniwersalnym dawcą wszystkich składników krwi.', false, 'Zgodność zależy od przetaczanego składnika – np. dla osocza zasady są inne niż dla krwinek. Zawsze wykonuje się badania zgodności.'),
  tf('T', 'grupy', 'Przy przetaczaniu osocza zgodność w AB0 wygląda inaczej niż przy przetaczaniu krwinek czerwonych.', true, 'Osocze zawiera przeciwciała, więc liczy się, by nie reagowały z antygenami biorcy.'),
  tf('HT', 'krzepniecie', 'Krzepnięcie krwi jest częścią hemostazy.', true, 'Hemostaza obejmuje m.in. skurcz naczynia, czop płytkowy i krzepnięcie.'),
  tf('HT', 'krzepniecie', 'Podczas krzepnięcia rozpuszczalny fibrynogen przekształca się w nierozpuszczalny włóknik (fibrynę).', true, 'Sieć włóknika wzmacnia czop i tworzy skrzep.'),
  tf('HT', 'krzepniecie', 'Do krzepnięcia krwi potrzebne są jony wapnia.', true, 'Jony Ca²⁺ są niezbędne w wielu etapach krzepnięcia.'),
  tf('PHT', 'sklad', 'Elementy morfotyczne krwi u dorosłego powstają głównie w czerwonym szpiku kostnym.', true, 'Czerwony szpik kostny to główne miejsce powstawania krwinek.'),
  tf('PHT', 'sklad', 'Leukocyty są liczniejsze we krwi niż erytrocyty.', false, 'Erytrocytów jest setki razy więcej niż leukocytów.'),
  tf('PHT', 'sklad', 'Krew transportuje hormony.', true, 'Krew rozprowadza hormony, składniki odżywcze i produkty przemiany materii.'),
  tf('PHT', 'sklad', 'Krew uczestniczy w regulacji temperatury ciała.', true, 'Krew rozprowadza ciepło po organizmie.'),
  tf('PHT', 'erytrocyty', 'Hemoglobina zawiera żelazo.', true, 'Żelazo w hemie wiąże tlen.'),
  tf('HT', 'erytrocyty', 'Erytrocyty człowieka żyją około 120 dni.', true, 'Stare erytrocyty są usuwane m.in. w śledzionie i wątrobie.'),
  tf('HT', 'gazy', 'Jedna cząsteczka hemoglobiny może przyłączyć do czterech cząsteczek tlenu.', true, 'Hemoglobina ma cztery hemy – każdy wiąże jedną cząsteczkę O₂.'),
  tf('HT', 'gazy', 'Większość dwutlenku węgla jest transportowana we krwi w postaci jonów wodorowęglanowych.', true, 'Większość CO₂ płynie jako HCO₃⁻ w osoczu; część wiąże hemoglobina, część jest rozpuszczona.'),
  tf('HT', 'gazy', 'Tlenek węgla (CO) wiąże się z hemoglobiną słabiej niż tlen.', false, 'CO wiąże się z hemoglobiną znacznie silniej niż tlen – dlatego jest groźny.'),
  tf('PHT', 'cisnienie', 'Tętno to rytmiczne rozciąganie ściany tętnicy wywołane pracą serca.', true, 'Tętno wyczujesz np. na tętnicy promieniowej w nadgarstku.'),
  tf('PHT', 'cisnienie', 'Ciśnienie skurczowe jest wyższe od rozkurczowego.', true, 'Skurczowe – w czasie skurczu komór; rozkurczowe – podczas ich rozkurczu.'),
  tf('HT', 'cisnienie', 'Ciśnienie krwi jest najwyższe w żyłach głównych.', false, 'Najwyższe jest w aorcie i dużych tętnicach; w żyłach głównych – najniższe.'),
  tf('HT', 'leukocyty', 'Neutrofile potrafią fagocytować bakterie.', true, 'Neutrofile pochłaniają i trawią drobnoustroje (fagocytoza).'),
  tf('HT', 'leukocyty', 'Przeciwciała wytwarzają komórki pochodzące od limfocytów B.', true, 'Pobudzone limfocyty B przekształcają się w komórki plazmatyczne wytwarzające przeciwciała.'),
  tf('T', 'sklad', 'Hematokryt to odsetek objętości krwi zajmowany przez krwinki czerwone.', true, 'Np. hematokryt 45% – krwinki czerwone zajmują ok. 45% objętości próbki.'),

  /* ===================== KTO TU NIE PASUJE ===================== */
  odd('PHT', 'sklad', ['erytrocyt', 'leukocyt', 'trombocyt'], 'neuron', 'Neuron to komórka nerwowa – nie jest elementem morfotycznym krwi.'),
  odd('P', 'serce', ['lewa komora', 'prawy przedsionek', 'prawa komora'], 'oskrzele', 'Oskrzele należy do układu oddechowego, nie do serca.'),
  odd('PHT', 'naczynia', ['tętnice', 'żyły', 'naczynia włosowate'], 'nerwy', 'Nerwy należą do układu nerwowego.'),
  odd('P', 'naczynia', ['aorta', 'żyła główna', 'tętnica płucna'], 'tchawica', 'Tchawica to część dróg oddechowych.'),
  odd('P', 'osocze', ['woda', 'sole mineralne', 'glukoza'], 'erytrocyty', 'Erytrocyty to element morfotyczny, a nie składnik osocza.'),
  odd('HT', 'osocze', ['albuminy', 'fibrynogen', 'globuliny'], 'hemoglobina', 'Hemoglobina znajduje się w erytrocytach, a nie w osoczu.'),
  odd('HT', 'leukocyty', ['neutrofil', 'limfocyt', 'monocyt'], 'erytrocyt', 'Neutrofil, limfocyt i monocyt to leukocyty; erytrocyt – nie.'),
  odd('HT', 'krzepniecie', ['trombocyty', 'fibrynogen', 'jony wapnia'], 'insulina', 'Insulina to hormon regulujący poziom glukozy – nie jest czynnikiem krzepnięcia.'),
  odd('HT', 'grupy', ['grupa A', 'grupa B', 'grupa AB'], 'Rh−', 'Rh− to oznaczenie z układu Rh, a nie grupa układu AB0.'),
  odd('HT', 'serce', ['zastawka trójdzielna', 'zastawka dwudzielna', 'zastawka aortalna'], 'przegroda międzykomorowa', 'Przegroda oddziela komory – nie jest zastawką.'),
  odd('HT', 'krazenie-male', ['pień płucny', 'żyły płucne', 'naczynia włosowate płuc'], 'aorta', 'Aorta należy do krążenia dużego.'),
  odd('HT', 'krazenie-duze', ['aorta', 'żyły główne', 'tętnice nerkowe'], 'żyły płucne', 'Żyły płucne należą do krążenia małego.'),
  odd('P', 'sklad', ['transport tlenu', 'obrona organizmu', 'udział w krzepnięciu'], 'trawienie pokarmu', 'Trawienie to zadanie układu pokarmowego, a nie krwi.'),
  odd('T', 'sklad', ['RBC', 'WBC', 'PLT'], 'EKG', 'EKG to badanie elektrycznej pracy serca, a nie parametr morfologii krwi.'),
  odd('HT', 'krzepniecie', ['skurcz naczynia', 'czop płytkowy', 'sieć włóknika'], 'fagocytoza', 'Fagocytoza to mechanizm obronny, a nie etap hemostazy.'),
  odd('HT', 'gazy', ['O₂ (w płucach do krwi)', 'CO₂ (z krwi do pęcherzyków)', 'HCO₃⁻ (transport CO₂)'], 'glukoza (do pęcherzyków)', 'Glukoza nie jest gazem oddechowym i nie przechodzi do pęcherzyków płucnych.'),

  /* ===================== PARY ===================== */
  pair('PHT', 'erytrocyty', 'cells', 'Erytrocyty', 'Transport tlenu', 'Erytrocyty zawierają hemoglobinę wiążącą tlen.'),
  pair('PHT', 'leukocyty', 'cells', 'Leukocyty', 'Obrona organizmu', 'Leukocyty zwalczają drobnoustroje.'),
  pair('PHT', 'trombocyty', 'cells', 'Trombocyty', 'Udział w krzepnięciu', 'Płytki tworzą czop płytkowy.'),
  pair('PHT', 'osocze', 'cells', 'Osocze', 'Transport składników odżywczych i hormonów', 'Osocze rozprowadza rozpuszczone substancje.'),
  pair('PHT', 'gazy', 'cells', 'Hemoglobina', 'Wiązanie tlenu', 'Hemoglobina wiąże tlen dzięki żelazu w hemie.'),
  pair('PHT', 'serce', 'heart', 'Prawa komora', 'Tłoczy krew do pnia płucnego', 'Prawa komora rozpoczyna krążenie płucne.'),
  pair('PHT', 'serce', 'heart', 'Lewa komora', 'Tłoczy krew do aorty', 'Lewa komora rozpoczyna krążenie duże.'),
  pair('PHT', 'serce', 'heart', 'Prawy przedsionek', 'Przyjmuje krew z żył głównych', 'Krew z ciała wraca do prawego przedsionka.'),
  pair('PHT', 'serce', 'heart', 'Lewy przedsionek', 'Przyjmuje krew z żył płucnych', 'Krew z płuc wraca do lewego przedsionka.'),
  pair('PHT', 'serce', 'heart', 'Zastawki', 'Zapobiegają cofaniu się krwi', 'Zastawki zapewniają jednokierunkowy przepływ.'),
  pair('PHT', 'naczynia', 'vessels', 'Tętnice', 'Prowadzą krew od serca', 'Kierunek przepływu decyduje o nazwie naczynia.'),
  pair('PHT', 'naczynia', 'vessels', 'Żyły', 'Prowadzą krew do serca', 'Żyły doprowadzają krew do przedsionków.'),
  pair('PHT', 'naczynia', 'vessels', 'Naczynia włosowate', 'Wymiana substancji z tkankami', 'Ich ściana ma jedną warstwę komórek.'),
  pair('PHT', 'naczynia', 'vessels', 'Aorta', 'Największa tętnica ciała', 'Aorta wychodzi z lewej komory.'),
  pair('HT', 'leukocyty', 'immune', 'Neutrofile', 'Fagocytoza bakterii', 'Neutrofile jako pierwsze docierają do miejsca zakażenia.'),
  pair('HT', 'leukocyty', 'immune', 'Limfocyty B', 'Wytwarzanie przeciwciał (po przekształceniu)', 'Komórki plazmatyczne pochodzą od limfocytów B.'),
  pair('HT', 'leukocyty', 'immune', 'Limfocyty T', 'Niszczenie zakażonych komórek i regulacja odporności', 'Limfocyty T to m.in. komórki cytotoksyczne i pomocnicze.'),
  pair('HT', 'leukocyty', 'immune', 'Monocyty', 'Przekształcają się w makrofagi', 'Makrofagi fagocytują drobnoustroje i resztki komórek.'),
  pair('HT', 'leukocyty', 'immune', 'Eozynofile', 'Zwalczanie pasożytów, udział w reakcjach alergicznych', 'Eozynofile mają ziarnistości barwiące się eozyną.'),
  pair('HT', 'osocze', 'proteins', 'Albuminy', 'Utrzymanie ciśnienia onkotycznego, transport', 'Albuminy wiążą wodę w naczyniach i przenoszą wiele substancji.'),
  pair('HT', 'krzepniecie', 'proteins', 'Fibrynogen', 'Powstaje z niego włóknik', 'Fibrynogen przekształca się w nierozpuszczalną fibrynę.'),
  pair('HT', 'leukocyty', 'proteins', 'Immunoglobuliny', 'Przeciwciała', 'Immunoglobuliny (gamma-globuliny) to przeciwciała.'),
  pair('HT', 'osocze', 'proteins', 'Białka transportujące', 'Przenoszenie np. żelaza i hormonów', 'Np. transferyna przenosi żelazo.'),
  pair('HT', 'erytrocyty', 'morphology', 'RBC [10¹²/l]', 'Liczba erytrocytów', 'RBC – red blood cells.'),
  pair('HT', 'leukocyty', 'morphology', 'WBC [10⁹/l]', 'Liczba leukocytów', 'WBC – white blood cells.'),
  pair('HT', 'trombocyty', 'morphology', 'PLT [10⁹/l]', 'Liczba płytek krwi', 'PLT – platelets.'),
  pair('HT', 'erytrocyty', 'morphology', 'HGB [g/dl]', 'Stężenie hemoglobiny', 'HGB – hemoglobina.'),
  pair('HT', 'sklad', 'morphology', 'HCT [%]', 'Hematokryt – udział krwinek czerwonych w objętości krwi', 'HCT – hematokryt.'),
  pair('T', 'erytrocyty', 'morphology', 'MCV [fl]', 'Średnia objętość erytrocytu', 'MCV – mean corpuscular volume.'),

  /* ===================== SORTOWANIE ===================== */
  sort('PHT', 'osocze', 'plasma', 'Woda', 'Osocze', 'Woda to ok. 90% osocza.'),
  sort('PHT', 'osocze', 'plasma', 'Białka (np. albuminy)', 'Osocze', 'Białka osocza pełnią m.in. funkcje transportowe.'),
  sort('PHT', 'osocze', 'plasma', 'Sole mineralne', 'Osocze', 'Jony rozpuszczone są w osoczu.'),
  sort('PHT', 'osocze', 'plasma', 'Glukoza', 'Osocze', 'Glukoza jest transportowana w osoczu.'),
  sort('HT', 'osocze', 'plasma', 'Fibrynogen', 'Osocze', 'Fibrynogen to białko osocza.'),
  sort('PHT', 'osocze', 'plasma', 'Hormony', 'Osocze', 'Hormony krążą rozpuszczone w osoczu.'),
  sort('PHT', 'sklad', 'plasma', 'Erytrocyty', 'Elementy morfotyczne', 'Erytrocyty to krwinki czerwone.'),
  sort('PHT', 'sklad', 'plasma', 'Leukocyty', 'Elementy morfotyczne', 'Leukocyty to krwinki białe.'),
  sort('PHT', 'sklad', 'plasma', 'Trombocyty', 'Elementy morfotyczne', 'Trombocyty to płytki krwi.'),
  sort('HT', 'sklad', 'plasma', 'Limfocyty', 'Elementy morfotyczne', 'Limfocyty to rodzaj leukocytów.'),
  sort('HT', 'sklad', 'plasma', 'Neutrofile', 'Elementy morfotyczne', 'Neutrofile to rodzaj leukocytów.'),
  sort('PHT', 'naczynia', 'vessels', 'Prowadzą krew od serca', 'Tętnice', 'Definicja tętnicy opiera się na kierunku przepływu.'),
  sort('PHT', 'naczynia', 'vessels', 'Prowadzą krew do serca', 'Żyły', 'Żyły doprowadzają krew do serca.'),
  sort('PHT', 'naczynia', 'vessels', 'Grube, sprężyste ściany', 'Tętnice', 'Tętnice wytrzymują wysokie ciśnienie.'),
  sort('PHT', 'naczynia', 'vessels', 'Mają zastawki (np. w nogach)', 'Żyły', 'Zastawki żylne zapobiegają cofaniu się krwi.'),
  sort('PHT', 'naczynia', 'vessels', 'Tu zachodzi wymiana gazów z tkankami', 'Naczynia włosowate', 'Wymiana zachodzi przez cienką ścianę naczyń włosowatych.'),
  sort('HT', 'naczynia', 'vessels', 'Ściana z jednej warstwy komórek', 'Naczynia włosowate', 'Jedna warstwa śródbłonka ułatwia dyfuzję.'),
  sort('PHT', 'naczynia', 'vessels', 'Aorta', 'Tętnice', 'Aorta – największa tętnica.'),
  sort('PHT', 'naczynia', 'vessels', 'Żyła główna dolna', 'Żyły', 'Żyły główne uchodzą do prawego przedsionka.'),
  sort('HT', 'krazenie-male', 'vessels', 'Pień płucny (krew odtlenowana!)', 'Tętnice', 'Pień płucny to tętnica, choć płynie nim krew odtlenowana.'),
  sort('HT', 'krazenie-male', 'vessels', 'Żyły płucne (krew utlenowana!)', 'Żyły', 'Żyły płucne to żyły, choć płynie nimi krew utlenowana.'),
  sort('HT', 'cisnienie', 'vessels', 'Najwyższe ciśnienie krwi', 'Tętnice', 'Ciśnienie jest najwyższe w aorcie i dużych tętnicach.'),
  sort('T', 'naczynia', 'vessels', 'Najwolniejszy przepływ krwi', 'Naczynia włosowate', 'Ogromny łączny przekrój naczyń włosowatych spowalnia przepływ – jest czas na wymianę.'),
  sort('PHT', 'cisnienie', 'vessels', 'Tu wyczujesz tętno', 'Tętnice', 'Tętno bada się na tętnicach, np. promieniowej.'),
  sort('PHT', 'erytrocyty', 'cellfunc', 'Transport tlenu', 'Erytrocyty', 'Tlen wiąże hemoglobina erytrocytów.'),
  sort('PHT', 'erytrocyty', 'cellfunc', 'Zawierają hemoglobinę', 'Erytrocyty', 'Hemoglobina nadaje krwi czerwony kolor.'),
  sort('HT', 'erytrocyty', 'cellfunc', 'Kształt dwuwklęsłego krążka', 'Erytrocyty', 'Kształt zwiększa powierzchnię wymiany gazowej.'),
  sort('PHT', 'leukocyty', 'cellfunc', 'Pochłanianie bakterii', 'Leukocyty', 'Fagocytoza – np. neutrofile, makrofagi.'),
  sort('PHT', 'leukocyty', 'cellfunc', 'Mają jądro komórkowe', 'Leukocyty', 'Leukocyty to pełne komórki z jądrem.'),
  sort('HT', 'leukocyty', 'cellfunc', 'Wytwarzanie przeciwciał', 'Leukocyty', 'Przeciwciała wytwarzają komórki pochodzące od limfocytów B.'),
  sort('PHT', 'trombocyty', 'cellfunc', 'Tworzą czop płytkowy', 'Trombocyty', 'Płytki przylegają do uszkodzonej ściany i sklejają się.'),
  sort('PHT', 'trombocyty', 'cellfunc', 'Pomagają zatamować krwawienie', 'Trombocyty', 'Trombocyty uczestniczą w hemostazie.'),
  sort('HT', 'trombocyty', 'cellfunc', 'Powstają z megakariocytów', 'Trombocyty', 'Płytki to fragmenty cytoplazmy megakariocytów.'),
  sort('HT', 'krzepniecie', 'cellfunc', 'Uwalniają substancje aktywujące krzepnięcie', 'Trombocyty', 'Aktywne płytki wspierają kaskadę krzepnięcia.'),

  /* ===================== SZYBKI WYBÓR ===================== */
  quiz('PHT', 'sklad', 'Gdzie u dorosłego powstają głównie krwinki?', 'W czerwonym szpiku kostnym', ['W sercu', 'W żółtym szpiku kostnym', 'W płucach'], 'Czerwony szpik kostny to główne miejsce krwiotworzenia.'),
  quiz('PHT', 'serce', 'Która jama serca tłoczy krew do aorty?', 'Lewa komora', ['Prawa komora', 'Lewy przedsionek', 'Prawy przedsionek'], 'Lewa komora rozpoczyna krążenie duże.'),
  quiz('PHT', 'krazenie-male', 'Dokąd wpływa krew z żył płucnych?', 'Do lewego przedsionka', ['Do prawego przedsionka', 'Do lewej komory', 'Do prawej komory'], 'Krążenie małe kończy się w lewym przedsionku.'),
  quiz('PHT', 'krazenie-male', 'Którym naczyniem krew opuszcza prawą komorę?', 'Pniem płucnym', ['Aortą', 'Żyłą główną', 'Żyłami płucnymi'], 'Pień płucny dzieli się na tętnice płucne.'),
  quiz('PHT', 'erytrocyty', 'Które białko wiąże tlen w erytrocytach?', 'Hemoglobina', ['Fibrynogen', 'Albumina', 'Keratyna'], 'Hemoglobina zawiera żelazo wiążące O₂.'),
  quiz('HT', 'erytrocyty', 'Jaki pierwiastek w hemie wiąże tlen?', 'Żelazo', ['Wapń', 'Sód', 'Jod'], 'Fe²⁺ w hemie wiąże cząsteczkę tlenu.'),
  quiz('PHT', 'grupy', 'Jakie antygeny mają erytrocyty grupy A?', 'Antygen A', ['Antygen B', 'Antygeny A i B', 'Żadnego z nich'], 'Grupa A – antygen A na erytrocytach.'),
  quiz('PHT', 'grupy', 'Jakie antygeny mają erytrocyty grupy 0?', 'Ani A, ani B', ['Tylko A', 'Tylko B', 'A i B'], 'Grupa 0 – brak antygenów A i B.'),
  quiz('HT', 'grupy', 'Jakie przeciwciała w osoczu ma osoba z grupą A?', 'Anty-B', ['Anty-A', 'Anty-A i anty-B', 'Żadnych z nich'], 'Grupa A: antygen A, przeciwciała anty-B.'),
  quiz('HT', 'grupy', 'Jakie przeciwciała układu AB0 ma osoba z grupą AB?', 'Ani anty-A, ani anty-B', ['Anty-A', 'Anty-B', 'Anty-A i anty-B'], 'Grupa AB ma oba antygeny, więc nie ma przeciwciał anty-A i anty-B.'),
  quiz('P', 'rh', 'Co ma na erytrocytach osoba Rh+?', 'Antygen D (czynnik Rh)', ['Antygen A', 'Hemoglobinę bez żelaza', 'Przeciwciała anty-D'], 'Rh+ oznacza obecność antygenu D.'),
  quiz('HT', 'rh', 'Co oznacza zapis Rh−?', 'Brak antygenu D na erytrocytach', ['Brak antygenów A i B', 'Brak hemoglobiny', 'Krew, która nie krzepnie'], 'Rh− – brak antygenu D; układ Rh jest niezależny od AB0.'),
  quiz('HT', 'krzepniecie', 'Z czego powstaje włóknik (fibryna)?', 'Z fibrynogenu', ['Z hemoglobiny', 'Z albumin', 'Z glukozy'], 'Trombina przekształca fibrynogen w fibrynę.'),
  quiz('HT', 'krzepniecie', 'Który jon jest niezbędny do krzepnięcia krwi?', 'Ca²⁺', ['Na⁺', 'K⁺', 'Cl⁻'], 'Jony wapnia biorą udział w wielu etapach krzepnięcia.'),
  quiz('HT', 'gazy', 'W jakiej postaci krew transportuje większość CO₂?', 'Jonów HCO₃⁻ w osoczu', ['Związanego z żelazem hemu', 'Tlenku węgla', 'Wyłącznie rozpuszczonego gazu'], 'Większość CO₂ krąży jako jony wodorowęglanowe.'),
  quiz('PHT', 'gazy', 'Gdzie krew oddaje CO₂ do usunięcia z organizmu?', 'W naczyniach włosowatych płuc', ['W lewej komorze', 'W aorcie', 'W mięśniach'], 'CO₂ przechodzi z krwi do pęcherzyków płucnych.'),
  quiz('HT', 'leukocyty', 'Który leukocyt przekształca się w makrofaga?', 'Monocyt', ['Limfocyt', 'Erytrocyt', 'Trombocyt'], 'Monocyty po wyjściu do tkanek stają się makrofagami.'),
  quiz('PHT', 'cisnienie', 'Gdzie najłatwiej zbadać tętno?', 'Na tętnicy w nadgarstku', ['Na żyle łokciowej', 'Na naczyniu włosowatym', 'Na żyle głównej'], 'Tętno wyczuwa się na tętnicach, np. promieniowej.'),
  quiz('PHT', 'cisnienie', 'Pomiar: 120/80 mm Hg. Co oznacza liczba 80?', 'Ciśnienie rozkurczowe', ['Ciśnienie skurczowe', 'Tętno', 'Liczbę oddechów'], 'Pierwsza liczba – skurczowe, druga – rozkurczowe.'),
  quiz('HT', 'serce', 'Która zastawka leży między lewym przedsionkiem a lewą komorą?', 'Dwudzielna (mitralna)', ['Trójdzielna', 'Półksiężycowata aorty', 'Półksiężycowata pnia płucnego'], 'Po lewej – dwudzielna, po prawej – trójdzielna.'),
  quiz('P', 'naczynia', 'Które naczynia mają najcieńsze ściany?', 'Naczynia włosowate', ['Tętnice', 'Żyły', 'Aorta'], 'Ściana naczynia włosowatego to jedna warstwa komórek.'),
  quiz('P', 'sklad', 'Których elementów morfotycznych jest we krwi najwięcej?', 'Erytrocytów', ['Leukocytów', 'Trombocytów', 'Wszystkich jest tyle samo'], 'Erytrocyty są zdecydowanie najliczniejsze.'),
  quiz('T', 'sklad', 'Hematokryt 45% oznacza, że…', '…krwinki czerwone zajmują ok. 45% objętości krwi', ['…osocze to 45% objętości krwi', '…45% krwinek to leukocyty', '…krew zawiera 45% wody'], 'Hematokryt opisuje udział krwinek czerwonych w objętości krwi.'),
];
