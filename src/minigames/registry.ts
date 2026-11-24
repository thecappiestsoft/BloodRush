import type { MiniGameMeta } from '../types';
import { bankFor } from '../engine/bank';
import { getLang } from '../i18n';
import { MINIGAMES_EN } from './registry.en';
import CatchErythrocytes from './reflex/CatchErythrocytes';
import LeukocyteDefense from './reflex/LeukocyteDefense';
import PlugWound from './reflex/PlugWound';
import NoEmbolism from './reflex/NoEmbolism';
import OxygenTransport from './reflex/OxygenTransport';
import BloodPath from './logic/BloodPath';
import MatchFunction from './logic/MatchFunction';
import { MORPH, pairGroups } from './common/bankHelpers';
import OddOneOut from './logic/OddOneOut';
import HeartLabels from './logic/HeartLabels';
import TrueFalse from './logic/TrueFalse';
import MemorySequence from './memory/MemorySequence';
import MemoryGroups from './memory/MemoryGroups';
import VanishingLabels from './memory/VanishingLabels';
import FindError from './observation/FindError';
import FindCell from './observation/FindCell';
import SpotChange from './observation/SpotChange';
import { ArteryVein, SortBlood, SortFunctions, sortPool } from './classification/BankSort';
import CalcComposition from './math/CalcComposition';
import Morphology from './math/Morphology';
import CountBeats from './math/CountBeats';
import Donor from './math/Donor';
import BuildCirculation from './spatial/BuildCirculation';
import ConnectVessels from './spatial/ConnectVessels';
import FixHeart from './spatial/FixHeart';
import ArrangeOrder from './spatial/ArrangeOrder';
import HemoCatch from './reflex/HemoCatch';
import PressureStop from './reflex/PressureStop';
import PulseTap from './reflex/PulseTap';
import Valves from './logic/Valves';
import GasExchange from './classification/GasExchange';
import QuickQuiz from './logic/QuickQuiz';
import GrandCirculation from './boss/GrandCirculation';

const ALL3 = ['primary', 'highschool', 'technical'] as const;
const HT = ['highschool', 'technical'] as const;

/**
 * Rejestr minigier. Każda minigra to niezależny komponent; tutaj są tylko metadane:
 * kategorie, poziomy, trudność (→ czas), polecenia i informacje edukacyjne.
 */
export const MINIGAMES: MiniGameMeta[] = [
  /* ---------- A. ZRĘCZNOŚCIOWE ---------- */
  { id: 'catch-rbc', name: 'Złap erytrocyty', type: 'reflex', categories: ['erytrocyty', 'sklad'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'medium' }, instruction: 'ZŁAP ERYTROCYTY!',
    fact: 'Erytrocyty zawierają hemoglobinę, która umożliwia transport tlenu.',
    learn: 'Erytrocyty (krwinki czerwone) to najliczniejsze elementy morfotyczne. Dojrzałe nie mają jądra, mają kształt dwuwklęsłego krążka i są wypełnione hemoglobiną wiążącą tlen. Uczestniczą też w transporcie części CO₂.',
    component: CatchErythrocytes },
  { id: 'leuko-defense', name: 'Uciekające bakterie', type: 'reflex', categories: ['leukocyty'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'medium' }, instruction: { primary: 'WYŚLIJ LEUKOCYTY!', highschool: 'AKTYWUJ FAGOCYTY!', technical: 'AKTYWUJ FAGOCYTY!' },
    fact: 'Leukocyty pełnią funkcje obronne i uczestniczą w odpowiedzi immunologicznej.',
    learn: 'Leukocyty to krwinki białe z jądrem. Neutrofile i monocyty (w tkankach – makrofagi) pochłaniają drobnoustroje (fagocytoza). Limfocyty B i T odpowiadają za odporność swoistą, np. wytwarzanie przeciwciał.',
    component: LeukocyteDefense },
  { id: 'plug-wound', name: 'Zatkaj ranę', type: 'reflex', categories: ['trombocyty', 'krzepniecie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: { primary: 'ZATKAJ RANĘ!', highschool: 'ZATAMUJ KRWAWIENIE!', technical: 'URUCHOM HEMOSTAZĘ!' },
    fact: 'Trombocyty uczestniczą w hemostazie, m.in. tworząc czop płytkowy.',
    learn: 'Hemostaza to zespół procesów zatrzymujących krwawienie: skurcz uszkodzonego naczynia, utworzenie czopu płytkowego oraz krzepnięcie krwi, w którym fibrynogen przekształca się w nierozpuszczalny włóknik (fibrynę). Potrzebne są m.in. jony wapnia.',
    component: PlugWound },
  { id: 'no-embolism', name: 'Nie pozwól na zator', type: 'reflex', categories: ['krzepniecie', 'naczynia'], levels: [...ALL3],
    difficulty: { primary: 'hard', highschool: 'hard', technical: 'hard' }, instruction: 'NIE POZWÓL NA ZATOR!',
    fact: 'Skrzep w świetle naczynia może zablokować przepływ krwi.',
    learn: 'To edukacyjna abstrakcja: w zdrowym naczyniu płynie zawiesina krwinek w osoczu. Krzepnięcie jest potrzebne w miejscu urazu, ale skrzep oderwany i niesiony z krwią (zator) może zablokować naczynie.',
    component: NoEmbolism },
  { id: 'oxygen-transport', name: 'Transport tlenu', type: 'reflex', categories: ['gazy', 'erytrocyty'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'DOSTARCZ TLEN!',
    fact: 'Erytrocyty pobierają tlen w płucach i oddają go w tkankach.',
    learn: 'W naczyniach włosowatych płuc tlen dyfunduje z pęcherzyków do krwi i wiąże się z hemoglobiną. W tkankach tlen jest oddawany, a CO₂ przechodzi do krwi – większość jako jony HCO₃⁻ w osoczu, część związana z hemoglobiną.',
    component: OxygenTransport },
  { id: 'hemo-catch', name: 'Załaduj hemoglobinę', type: 'reflex', categories: ['gazy', 'erytrocyty'], levels: [...ALL3],
    difficulty: { primary: 'hard', highschool: 'hard', technical: 'hard' }, instruction: 'ZAŁADUJ HEMOGLOBINĘ!',
    fact: 'Jedna cząsteczka hemoglobiny może związać do 4 cząsteczek tlenu.',
    learn: 'Hemoglobina zbudowana jest z 4 łańcuchów białkowych, z których każdy zawiera hem z jonem żelaza. Tlenek węgla (CO) wiąże się z hemoglobiną znacznie silniej niż tlen, dlatego zatrucie CO jest groźne.',
    component: HemoCatch },
  { id: 'pressure-stop', name: 'Ciśnieniomierz', type: 'reflex', categories: ['cisnienie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: 'ZATRZYMAJ WSKAZÓWKĘ!',
    fact: 'Zapis 120/80 mm Hg: ciśnienie skurczowe / rozkurczowe.',
    learn: 'Ciśnienie tętnicze mierzy się w mm Hg. Skurczowe występuje podczas skurczu komór, rozkurczowe – w czasie ich rozkurczu. Wartości w grze są przykładowe i nie służą do oceny zdrowia.',
    component: PressureStop },
  { id: 'pulse-tap', name: 'Wystukaj tętno', type: 'reflex', categories: ['cisnienie', 'serce'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'WYSTUKAJ RYTM SERCA!', delayedTimer: true,
    fact: 'Tętno to liczba uderzeń serca na minutę wyczuwana na tętnicy.',
    learn: 'Tętno bada się np. na tętnicy promieniowej. Można liczyć uderzenia przez 15 s i pomnożyć przez 4. Tętno spoczynkowe dorosłego zwykle wynosi ok. 60–100/min; u osób wytrenowanych bywa niższe.',
    component: PulseTap },

  /* ---------- B. LOGICZNE ---------- */
  { id: 'blood-path', name: 'Uporządkuj drogę krwi', type: 'logic', categories: ['krazenie-male', 'krazenie-duze', 'serce'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'UŁÓŻ DROGĘ KRWI!',
    fact: 'Krew płynie: prawa komora → płuca → lewy przedsionek → lewa komora → ciało → prawy przedsionek.',
    learn: 'Krążenie płucne (małe) prowadzi krew z prawej komory przez płuca do lewego przedsionka. Krążenie ustrojowe (duże) prowadzi krew z lewej komory przez ciało do prawego przedsionka.',
    component: BloodPath },
  { id: 'match-function', name: 'Dopasuj element do funkcji', type: 'logic', categories: ['sklad', 'erytrocyty', 'leukocyty', 'trombocyty', 'osocze', 'serce', 'naczynia'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'medium' }, instruction: 'POŁĄCZ W PARY!',
    fact: 'Każdy element układu krwionośnego ma swoją funkcję.',
    learn: 'Budowa jest związana z funkcją: np. erytrocyty bez jądra mieszczą więcej hemoglobiny, a grube ściany lewej komory pozwalają tłoczyć krew do całego ciała.',
    available: (b, l, c) => pairGroups(b, l, c, (g) => g !== MORPH).length > 0, component: MatchFunction },
  { id: 'odd-one-out', name: 'Kto tu nie pasuje?', type: 'logic', categories: ['sklad', 'serce', 'naczynia', 'osocze', 'leukocyty', 'krzepniecie', 'grupy', 'krazenie-male', 'krazenie-duze', 'gazy'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'KTO TU NIE PASUJE?',
    fact: 'Elementy morfotyczne krwi to erytrocyty, leukocyty i trombocyty.',
    learn: 'Klasyfikowanie pojęć pomaga uporządkować wiedzę: elementy morfotyczne, składniki osocza, części serca, naczynia krążenia małego i dużego.',
    available: (b, l, c) => bankFor(b, 'odd', l, c).length > 0, component: OddOneOut },
  { id: 'heart-labels', name: 'Uzupełnij schemat serca', type: 'logic', categories: ['serce'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'PODPISZ SERCE!',
    fact: 'Serce ma cztery jamy: dwa przedsionki i dwie komory.',
    learn: 'Na schematach serce rysuje się zwykle w widoku od przodu, więc jego prawa strona jest po lewej stronie rysunku. Do prawego przedsionka uchodzą żyły główne, z prawej komory wychodzi pień płucny, do lewego przedsionka uchodzą żyły płucne, a z lewej komory wychodzi aorta.',
    component: HeartLabels },
  { id: 'true-false', name: 'Prawda czy fałsz?', type: 'logic', categories: ['sklad', 'erytrocyty', 'leukocyty', 'trombocyty', 'osocze', 'grupy', 'rh', 'krzepniecie', 'serce', 'naczynia', 'krazenie-male', 'krazenie-duze', 'gazy', 'cisnienie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'PRAWDA CZY FAŁSZ?',
    fact: 'Uważne czytanie to połowa sukcesu!',
    learn: 'Zwróć uwagę na słowa „zawsze”, „nigdy”, „wszystkie” – często kryją pułapki. Np. tętnice nie zawsze niosą krew utlenowaną.',
    available: (b, l, c) => bankFor(b, 'tf', l, c).length >= 3, component: TrueFalse },
  { id: 'valves', name: 'Ustaw zastawki', type: 'logic', categories: ['serce'], levels: [...HT],
    difficulty: { highschool: 'hard', technical: 'hard' }, instruction: 'USTAW ZASTAWKI!',
    fact: 'Zastawki zapewniają jednokierunkowy przepływ krwi przez serce.',
    learn: 'Zastawki przedsionkowo-komorowe: trójdzielna (prawa) i dwudzielna/mitralna (lewa). Zastawki półksiężycowate: pnia płucnego i aorty. W skurczu komór otwierają się półksiężycowate, a przedsionkowo-komorowe zamykają się; w rozkurczu – odwrotnie.',
    component: Valves },
  { id: 'quick-quiz', name: 'Szybki wybór', type: 'logic', categories: ['sklad', 'erytrocyty', 'leukocyty', 'osocze', 'grupy', 'rh', 'krzepniecie', 'serce', 'naczynia', 'krazenie-male', 'gazy', 'cisnienie'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'SZYBKI WYBÓR!',
    fact: 'Szybka decyzja – ale przemyślana!',
    learn: 'Pytania z bazy zadań – nauczyciel może je edytować i dodawać własne w panelu nauczyciela.',
    available: (b, l, c) => bankFor(b, 'quiz', l, c).length > 0, component: QuickQuiz },

  /* ---------- C. PAMIĘCIOWE ---------- */
  { id: 'memory-sequence', name: 'Zapamiętaj skład krwi', type: 'memory', categories: ['sklad', 'erytrocyty', 'leukocyty', 'trombocyty'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'easy', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ KOLEJNOŚĆ!', delayedTimer: true,
    fact: 'Erytrocyty i trombocyty nie mają jądra, leukocyty – mają.',
    learn: 'Rozpoznawanie elementów morfotycznych: erytrocyt – czerwony, bez jądra, dwuwklęsły; trombocyt – mały fragment komórki; neutrofil – jądro płatowate; limfocyt – duże okrągłe jądro; monocyt – jądro nerkowate; eozynofil – pomarańczowe ziarnistości.',
    component: MemorySequence },
  { id: 'memory-groups', name: 'Zapamiętaj grupy krwi', type: 'memory', categories: ['grupy', 'rh'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ GRUPY KRWI!', delayedTimer: true,
    fact: 'Układy AB0 i Rh są od siebie niezależne.',
    learn: 'W układzie AB0 wyróżniamy grupy A, B, AB i 0 – zależnie od antygenów A i B na erytrocytach. Czynnik Rh (antygen D) określa się niezależnie: Rh+ lub Rh−.',
    component: MemoryGroups },
  { id: 'vanishing-labels', name: 'Znikające podpisy', type: 'memory', categories: ['serce'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ SCHEMAT SERCA!', delayedTimer: true,
    fact: 'Przedsionki przyjmują krew, komory ją wypompowują.',
    learn: 'Przedsionki mają cieńsze ściany i przyjmują krew z żył. Komory mają grubsze ściany i tłoczą krew do tętnic – lewa komora ma najgrubszą ścianę.',
    component: VanishingLabels },

  /* ---------- D. OBSERWACYJNE ---------- */
  { id: 'find-error', name: 'Znajdź błąd', type: 'observation', categories: ['krazenie-male', 'krazenie-duze'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'ZNAJDŹ BŁĄD W SCHEMACIE!',
    fact: 'Krew w krążeniu płynie zawsze w jednym kierunku.',
    learn: 'Pełna droga krwi: prawy przedsionek → prawa komora → pień płucny → tętnice płucne → naczynia włosowate płuc → żyły płucne → lewy przedsionek → lewa komora → aorta → tętnice → naczynia włosowate tkanek → żyły → żyły główne → prawy przedsionek.',
    component: FindError },
  { id: 'find-cell', name: 'Znajdź właściwą krwinkę', type: 'observation', categories: ['erytrocyty', 'leukocyty', 'trombocyty'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'ZNAJDŹ WŁAŚCIWĄ KRWINKĘ!',
    fact: 'Budowa krwinek jest związana z ich funkcją.',
    learn: 'Kształt jądra pomaga rozpoznać leukocyty w preparacie: neutrofil – płatowate, limfocyt – duże okrągłe, monocyt – nerkowate, eozynofil – dwupłatowe z pomarańczowymi ziarnistościami.',
    component: FindCell },
  { id: 'spot-change', name: 'Co się zmieniło?', type: 'observation', categories: ['sklad', 'erytrocyty', 'leukocyty', 'trombocyty'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'CO SIĘ ZMIENIŁO?', delayedTimer: true,
    fact: 'Uważna obserwacja preparatu to podstawa pracy w laboratorium.',
    learn: 'W rozmazie krwi najwięcej jest erytrocytów; leukocytów jest znacznie mniej, a płytki krwi są najmniejsze.',
    component: SpotChange },

  /* ---------- E. KLASYFIKACYJNE ---------- */
  { id: 'sort-blood', name: 'Sortowanie krwi', type: 'classification', categories: ['sklad', 'osocze'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'POSORTUJ SKŁADNIKI KRWI!',
    fact: 'Krew = osocze (ok. 55%) + elementy morfotyczne (ok. 45%).',
    learn: 'Osocze to płynna część krwi (ok. 90% wody, białka, sole mineralne, glukoza, hormony). Elementy morfotyczne to erytrocyty, leukocyty i trombocyty.',
    available: (b, l, c) => sortPool(b, 'plasma', l, c).ok, component: SortBlood },
  { id: 'artery-vein', name: 'Tętnica czy żyła?', type: 'classification', categories: ['naczynia', 'krazenie-male', 'cisnienie'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'TĘTNICA CZY ŻYŁA?',
    fact: 'Tętnice prowadzą krew od serca, żyły do serca – niezależnie od jej utlenowania.',
    learn: 'Tętnice: grube, sprężyste ściany, wysokie ciśnienie. Żyły: cieńsze ściany, często zastawki. Naczynia włosowate: ściana z jednej warstwy komórek, wymiana substancji. Pień płucny to tętnica z krwią odtlenowaną, a żyły płucne – żyły z krwią utlenowaną.',
    available: (b, l, c) => sortPool(b, 'vessels', l, c).ok, component: ArteryVein },
  { id: 'sort-functions', name: 'Posortuj funkcje', type: 'classification', categories: ['erytrocyty', 'leukocyty', 'trombocyty'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'POSORTUJ FUNKCJE!',
    fact: 'Erytrocyty – transport gazów, leukocyty – obrona, trombocyty – hemostaza.',
    learn: 'Erytrocyty transportują głównie tlen (hemoglobina). Leukocyty bronią organizmu. Trombocyty uczestniczą w hemostazie – tworzą czop płytkowy i wspierają krzepnięcie.',
    available: (b, l, c) => sortPool(b, 'cellfunc', l, c).ok, component: SortFunctions },
  { id: 'gas-exchange', name: 'Wymiana gazowa', type: 'classification', categories: ['gazy', 'krazenie-male'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'easy', technical: 'medium' }, instruction: 'DO KRWI CZY Z KRWI?',
    fact: 'Gazy dyfundują z miejsca o wyższym stężeniu do miejsca o niższym.',
    learn: 'W płucach: O₂ z pęcherzyków do krwi, CO₂ z krwi do pęcherzyków. W tkankach: O₂ z krwi do komórek, CO₂ z komórek do krwi.',
    component: GasExchange },

  /* ---------- F. MATEMATYCZNO-ANALITYCZNE ---------- */
  { id: 'calc-composition', name: 'Oblicz skład krwi', type: 'math', categories: ['sklad', 'osocze'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'OBLICZ SKŁAD KRWI!',
    fact: 'Osocze to ok. 55% objętości krwi.',
    learn: 'Hematokryt to odsetek objętości krwi zajmowany przez krwinki czerwone. Objętość osocza ≈ objętość krwi × (100% − hematokryt). Dane w zadaniach są uproszczone i szkoleniowe.',
    component: CalcComposition },
  { id: 'morphology', name: 'Analiza morfologii', type: 'math', categories: ['sklad', 'erytrocyty', 'leukocyty', 'trombocyty'], levels: [...HT],
    difficulty: { highschool: 'medium', technical: 'hard' }, instruction: 'ODCZYTAJ WYDRUK MORFOLOGII!',
    fact: 'Morfologia krwi opisuje liczbę i cechy elementów morfotycznych.',
    learn: 'Skróty: RBC – erytrocyty, WBC – leukocyty, PLT – płytki krwi, HGB – hemoglobina, HCT – hematokryt, MCV – średnia objętość erytrocytu. Interpretacja wyników należy do lekarza; gra nie diagnozuje.',
    available: (b, l, c) => pairGroups(b, l, c, (g) => g === MORPH).length > 0, component: Morphology },
  { id: 'count-beats', name: 'Policz uderzenia serca', type: 'math', categories: ['serce', 'cisnienie'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'veryEasy', technical: 'easy' }, instruction: 'POLICZ UDERZENIA SERCA!', delayedTimer: true,
    fact: 'Każde uderzenie serca to skurcz komór.',
    learn: 'Liczbę uderzeń na minutę można obliczyć z krótszego pomiaru: uderzenia w 15 s × 4, w 10 s × 6, w 5 s × 12 (im krótszy pomiar, tym mniej dokładny).',
    component: CountBeats },
  { id: 'donor', name: 'Dopasuj grupę krwi', type: 'math', categories: ['grupy', 'rh'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'hard', technical: 'hard' }, instruction: { primary: 'ROZPOZNAJ GRUPĘ KRWI!', highschool: 'DOBIERZ DAWCĘ!', technical: 'DOBIERZ DAWCĘ!' },
    fact: 'Zgodność transfuzji zależy od rodzaju przetaczanego składnika krwi.',
    learn: 'Dla koncentratu krwinek czerwonych liczą się antygeny na krwinkach dawcy: nie mogą reagować z przeciwciałami biorcy (np. biorca A ma anty-B). Dla osocza liczą się przeciwciała w osoczu dawcy. Biorca Rh− powinien otrzymać krwinki Rh−. W praktyce zawsze wykonuje się badania zgodności (próbę krzyżową).',
    component: Donor },

  /* ---------- G. PRZESTRZENNE I MANIPULACYJNE ---------- */
  { id: 'build-circulation', name: 'Zbuduj układ krwionośny', type: 'spatial', categories: ['krazenie-male', 'krazenie-duze', 'naczynia'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'veryHard' }, instruction: 'ZBUDUJ UKŁAD KRWIONOŚNY!',
    fact: 'Układ krwionośny człowieka jest zamknięty i ma dwa obiegi.',
    learn: 'Krążenie małe (płucne) służy wymianie gazowej w płucach. Krążenie duże (ustrojowe) doprowadza krew utlenowaną do narządów i odprowadza z nich krew odtlenowaną.',
    component: BuildCirculation },
  { id: 'connect-vessels', name: 'Połącz naczynia', type: 'spatial', categories: ['naczynia', 'krazenie-male', 'krazenie-duze'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'AWARIA! POŁĄCZ NACZYNIA!',
    fact: 'Naczynia łączą się w zamknięty obieg.',
    learn: 'Tętnice rozgałęziają się na coraz mniejsze naczynia aż do naczyń włosowatych, które łączą się w żyłki i żyły prowadzące krew z powrotem do serca.',
    component: ConnectVessels },
  { id: 'fix-heart', name: 'Napraw serce', type: 'spatial', categories: ['serce'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'NAPRAW SERCE!',
    fact: 'Prawa połowa serca pompuje krew do płuc, lewa – do całego ciała.',
    learn: 'Prawa i lewa połowa serca są oddzielone przegrodą – krew odtlenowana i utlenowana nie mieszają się.',
    component: FixHeart },
  { id: 'arrange-order', name: 'Ułóż elementy krwi', type: 'spatial', categories: ['sklad', 'trombocyty', 'krzepniecie', 'cisnienie', 'gazy'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: 'UŁÓŻ WEDŁUG KRYTERIUM!',
    fact: 'Porządkowanie pomaga zobaczyć zależności.',
    learn: 'Wielkość: trombocyt < erytrocyt < leukocyty (monocyt jest największy). Liczebność: erytrocyty > trombocyty > leukocyty. Ciśnienie spada od aorty do żył głównych.',
    component: ArrangeOrder },

  /* ---------- BOSS ---------- */
  { id: 'grand-circulation', name: 'Wielki Krwiobieg', type: 'spatial', categories: ['krazenie-male', 'krazenie-duze', 'erytrocyty', 'trombocyty', 'grupy'], levels: [...ALL3],
    difficulty: { primary: 'veryHard', highschool: 'veryHard', technical: 'veryHard' }, instruction: 'FINAŁ: WIELKI KRWIOBIEG!', timeOverride: 40, bossOnly: true,
    fact: 'Wszystkie elementy układu krwionośnego współpracują.',
    learn: 'Finał łączy drogę krwi, rozpoznawanie krwinek, hemostazę i zgodność grup krwi.',
    component: GrandCirculation },
];

/* Tłumaczenia: nazwa, polecenie, informacja i wyjaśnienie zależą od bieżącego języka. */
for (const g of MINIGAMES) {
  const pl = { name: g.name, instruction: g.instruction, fact: g.fact, learn: g.learn };
  const en = MINIGAMES_EN[g.id];
  for (const k of ['name', 'instruction', 'fact', 'learn'] as const) {
    Object.defineProperty(g, k, { get: () => (getLang() === 'en' && en ? en[k] : pl[k]), enumerable: true });
  }
}

export const gameById = (id: string) => MINIGAMES.find((g) => g.id === id)!;
export const textFor = (v: string | Partial<Record<string, string>>, level: string) => (typeof v === 'string' ? v : v[level] ?? Object.values(v)[0] ?? '');
