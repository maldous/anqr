import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Examples page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 * IDs 1044-1178 contain enhanced, unique content for each field.
 */
export const examples: PageDefinition = {
  title: 'Exemples ANQR',
  description: 'Cinc exemples d\'estil real del món real, de producció que mostren on els codis QR creen un valor considerable: al·lucinar un codi de comptadors antics, signes de pagaments i accions de "escan-to", imprimir l\' escalat dels volants als cartells, animació de QR per a cartells digitals, i la col·laboració bilingüe usant enllaços ancorables. Cada exemple inclou imatges, restriccions pràctiques i un enllaç de remix al generador.',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Obre la guia completa d\' usuari', type: 'guide' },
  ],

  sections: [
    // ===== Example 1: Uplift Existing Campaign (IDs 1044-1070) =====
    {
      heading: 'Estudi de caixa: Retail contra QR Uplift',
      paragraphs: ['Aquest exemple real del món segueix un petit cafè que havia utilitzat el mateix codi QR en el seu taulell durant tres anys. El codi original es va generar ràpidament durant la pressa pandèmica, imprès en paper estàndard, i es va ficar en un parany plàstic. Encara funciona - però els clients necessiten múltiples intents d\'escanejar-lo, i no va fer res per reforçar la identitat de la marca de cafè amb cura.', 'La transformació va començar amb una senzilla auditoria: el codi existent codificat l\' URL del menú en línia del cafè, que volien mantenir. El repte estava fent que la QR sentii part de l\'experiència de cafè en lloc d\'una utilitat després del 2020.'],
      images: [
        {
          src: '/images/examples/uplift-overview.png',
          alt: 'Un codi QR del temps en una posició de plàstic mostra l\'ús visible, les empremtes digitals i la impressió es va esvair',
          caption: 'El punt d\' inici: tres anys de servei contració havien deixat el QR amb prou feines funcional',
        },
      ],
    },
    {
      heading: 'Els problemes del codi original',
      paragraphs: ['La prova revelava múltiples qüestions: el codi original usat per la correcció d\' errors L (minimum redundància), tenia una zona tranquil de només dos mòduls, i s\'ha imprès en una resolució baixa. Sota la càlida il·luminació del cafè, els mòduls negres amb prou feines contrastats contra el paper groc. Els telèfons vells van lluitar; els telèfons més nous van tenir èxit però amb retard.', 'Més enllà dels temes tècnics, el quadrat genèric i blanc no es comunicava res sobre la marca. Els clients van dubtar abans d\'escanejar - una barrera subtil de confiança que reduïa el compromís amb el menú digital dissenyat amb cura del cafè.'],
      images: [
        {
          src: '/images/examples/uplift-diagnosis.png',
          alt: 'Un recobriment diagnòstic que mostra les desficions tècniques de QR: baixa ECC, zona mínima tranquil· la, pobre contrast',
          caption: 'Anàlisi tècnic revelant per què el codi llegat ha format en condicions reals del món',
        },
      ],
    },
    {
      heading: 'El procés Uplift',
      paragraphs: ['Usant l\'ANQR, el propietari del cafè ha tornat a crear el codi amb l\' URL del menú idèntica però ha millorat dramàticament els paràmetres: Correcció d\' errors H per a la màxima resistència, una zona tranquil·la de 6 mòduls per a detecció de límits fiables, i colors de marca (grans mòduls burgundy sobre fons de crema) que concorden amb la paleta interior del cafè.', 'S\'ha afegit un petit recobriment del centre amb el logo del cafè - es va mantenir deliberadament subtil per mantenir l\'escàner mentre proporcionava reconeixement de marca instantània. El mode de seguretat confirma que el nou disseny escaneja amb seguretat a través dels dispositius de prova abans de qualsevol impressió.'],
      images: [
        {
          src: '/images/examples/uplift-process.png',
          alt: 'La interfície ANQR que mostra la configuració: colors de marca, apropiat ECC, zona tranquil· la i subtil recobriment del logotip',
          caption: 'S\' està construint la configuració actualitzat: cada arranjament escollit per equilibrar l\' expressió de marca amb fiabilitat de l\' exploració',
        },
      ],
    },
    {
      heading: 'Resultats Measurables',
      paragraphs: ['Després d\' desplegar la nova QR en accions de cartes professionals Matte-laminats, el cafè es va rastrejar més de quatre setmanes. S\'ha millorat la taxa d\'escaneig d\'un 70% estimat a prop del 100%. Temps d\' exploració mitjana caigut des de 3-4 segons fins a 1 segon. La majoria significativament, el compromís del menú va augmentar el 40% - clients que van fer una ullada a la QR i van deixar córrer ara escanegeu amb confiança.', 'El Gabinet va informar menys preguntes als clients sobre "com utilitzar la QR" i no més instàncies d\'escriure manualment l\'URL per als clients frustrats. La marcada també va provocar converses, amb els clients comentar positivament en el disseny cohesiu.'],
      images: [
        {
          src: '/images/examples/uplift-results.png',
          alt: 'Una comparació abans/ després amb mètriques: taxa d\' escaneig, temps d\' exploració mitjana i millores setmanalment dels comptadors d\' exploració',
          caption: 'Quatre setmanes de dades mostren l\'impacte considerable d\'un impuls reflexiu QR',
        },
      ],
    },
    {
      heading: 'Torna a crear aquesta configuració',
      paragraphs: ['La configuració del cafè demostra conservadora però efectiva: Correcció d\' errors H, 6-modulmeu zona silenciosa, colors d\'última marca, i un recobriment mínim del centre. Aquest equilibri funciona per a la majoria d\' aplicacions de comptadors de detall on la fiabilitat ha d\'arribar primer però la presència de marca encara importa.', 'Obre el generador amb aquests arranjaments pre- carregats i adapteu els colors i recobriment a la vostra pròpia marca. La idea clau: les millores de fiabilitat només poden augmentar radicalment el compromís, fins i tot abans d\'afegir una unió visual.', 'Visualitzeu la guia d\'aprenentatge relacionada en millorar les campanyes QR existents per a la metodologia completa darrere d\'aquest enfocament.'],
      images: [
        {
          src: '/images/examples/uplift-config.png',
          alt: 'Enllaç al generador preconfigurat amb l\' arranjament del cafè per a la mida immediata',
          caption: 'Comença amb una configuració provada i a mida per a la vostra marca',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H&margin=6#render',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-0',
          label: 'Explora els articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 2: Branded Retail Payments (IDs 1071-1097) =====
    {
      heading: 'Estudi de casos: Visualització multi-Payment',
      paragraphs: ['Aquest exemple segueix una botiga de roba que havia acumulat cinc codis de QR diferents en el seu registre: un pagament banc, consells, Instagram, comentaris de Google i un enllaç de lloguer. Cadascun va ser generat des d\'una font diferent, impresa en diferents vegades, i mostrat en desaparellat. El caos visual va ser inculpar amb cura l\'estètica de la botiga i el personal es va fer càrrec regularment dels clients explorant el codi equivocat.', 'La solució necessària per separar les preocupacions: els codis de pagament necessiten una fiabilitat màxima amb l\'estopisme conservador, mentre que els codis de màrqueting podrien ser més expressius. El sistema de visualització unificat que mostra com equilibrar la presència de la marca contra les demandes funcionals de diferents casos d\'ús de QR.'],
      images: [
        {
          src: '/images/examples/payments-overview.png',
          alt: 'Una àrea de registre desocupada que mostra 5 codis QR desaparellats en diversos moments i imprimeix materials',
          caption: 'El punt d\' inici caòtic: 5 codis QR desconnectats de competència per cridar l\'atenció i la causa de confusió de clients',
        },
      ],
    },
    {
      heading: 'Abans de celebrar l\'experiència dels pagaments',
      paragraphs: ['El mètode principal de pagament de la botiga va usar un estàndard regional que necessitava una compatibilitat de càrrega de pagament. Les proves van revelar que fins i tot l\'esgotament menor va afectar la velocitat d\'escanejat amb certes aplicacions bancàries. La decisió: mantenir el pagament QR sense modificar excepte per a la mida optimització i la impressió professional a les accions de les cartes Matte.', 'Aquesta aproximació conservadora va significar que el codi de pagament menys semblava \'d\'acord que l\'ideal, però les taxes de compleció de transaccions van millorar radicalment. Els moments de pagament no són oportunitats de marca, són moments de fiabilitat. Els clients aprecien la velocitat i la certesa sobre les estètica quan els diners estan involucrats.'],
      images: [
        {
          src: '/images/examples/payments-primary.png',
          alt: 'Un codi de QR net, gran pagament en la borsa de cartes professional, posicionat prominentment al registre',
          caption: 'El pagament QR: Amidament generosament, imprès professionalment, conservadorament per al reconeixement immediat per les aplicacions bancàries',
        },
      ],
    },
    {
      heading: 'Creació de la pantalla d\' acció secundària',
      paragraphs: ['Per consells, crítiques, social i contractant, la botiga podria ser més expressiva. Aquests codis es van regenerar a ANQR amb marques consistents: la signatura de l\'oliva de la botiga sobre la crema, estil de mòdul arrodonit, i un recobriment subtil del centre amb la icona de la botiga. Correcció d\' errors Fins i tot la fiabilitat s\'assegurava.', 'Aquests quatre codis es van arranjar en una posició marcada del plafó al costat de (no competir) el codi de pagament. Neteja les etiquetes de la botiga explicaven cada propòsit de codi. La jerarquia visual va ser la intenció: el pagament es va quedar sol i prominent; les accions secundaries agrupades com a opcions.'],
      images: [
        {
          src: '/images/examples/payments-secondary.png',
          alt: 'Un plafó marcat que mostra quatre codis de QR d\' estil per a consells, revisions, social i contractades, amb etiquetes clares',
          caption: 'El plafó d\' acció secundari: consistentment, etiquetant, posicionat com a opcions en comptes de distracció',
        },
      ],
    },
    {
      heading: 'Mostra el disseny del sistema',
      paragraphs: ['La pantalla física resolta diversos problemes simultàniament. Tant el pagament com el plafó secundari van fer servir materials de Matte per eliminar la resplendor de la il·luminació per sobre. Heights va ser optimitzada per als clients d\'una estatura variable. Angles dirigits cap a la cua de clients en comptes de plana al taulell.', 'Críticament, la botiga va crear empremtes de recanvi dels enllaços de configuració ANQR bloquejats. Quan el codi de consells al final s\' ha modificat el cafè, el personal el va substituir en minuts usant la configuració desada - no les instantànies, no suposant a l\' arranjament, ni degradació de qualitat.'],
      images: [
        {
          src: '/images/examples/payments-display.png',
          alt: 'Un diagrama que mostra la disposició de la visualització física: alçada, angles, materials i la relació entre els pagaments i les pantalles secundaris',
          caption: 'Mostra la impressió blava del sistema: optimitzada física per escanejar fiables entre les alçades dels clients i les condicions d\' il· luminació',
        },
      ],
    },
    {
      heading: 'Millores d\' operació',
      paragraphs: ['Sis setmanes després del desplegament, la botiga documentava millores significatives: zero queixes de clients sobre la confusió del codi \'wrong\', vegades més ràpides, i un augment 3x en submissió de consell (les persones podrien trobar i explorar el codi de consell sense demanar ajuda estranyament personal). Les ressenyes de Google també van augmentar com a conseqüència de la fricció dedicada, ben etiquetada QR eliminada.', 'L\'entrenament de l\'Estat es va fer més senzill: "El codi de puntuació és el gran, tot el que hi ha al panell." Quan les aplicacions de pagament s\' actualitzen i apareixen breument l\'escanejat, el disseny del pagament conservador volia dir que encara funcionava, només més lentament en comptes de fallar completament.', 'Mireu la guia d\' aprenentatge dels codis QR per a pagar els pagaments dels principis darrere d\' aquest disseny del sistema.'],
      images: [
        {
          src: '/images/examples/payments-metrics.png',
          alt: 'Un tauler mètric que mostra abans de les comparacions: incidents de confusió, temps de transacció, freqüència de consell, submissió de revisió',
          caption: 'Sis setmanes de dades operatives demostren que l\'impacte del negoci d\'un sistema de pantalla multi-QR reflexitiu',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-7',
          label: 'Explora els articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 3: Print Scaling (IDs 1098-1124) =====
    {
      heading: 'Estudi de caixa: De la targeta professional a Billboard',
      paragraphs: ['Aquest exemple es prepara una empresa de producció d\'esdeveniments per a una gran conferència. Necessitaven el mateix codi QR - vinculant-se a l\'aplicació d\' esdeveniments - que es van usar a través de formats radicalment diferents: la placa de l\' assistent insereix (3cm), la taula tenda de cartes (8cm), el signe de registre d\'escriptori (30cm), la manera de trobar cartells (60cm), i un bàner massiu de l\'escenari (4 metres). Cada format tenia diferents distàncies de visualització, condicions d\' il· luminació i flux de treball de producció.', 'El repte no era simplement tècnic. Era operatiu. Diversos proveïdors van gestionar treballs d\' impressió diferents, i l\'empresa necessitava assegurar-se consistents, sense cap mena de resultats escanejats. La seva solució es va centrar en la documentació d\'exportació SVG i rigorosa.'],
      images: [
        {
          src: '/images/examples/print-overview.png',
          alt: 'Un collage que mostra el mateix codi QR usat per més de cinc mides diferents, de la placa a l\' estendard',
          caption: 'Un codi QR, cinc mides de desplegament: el repte de mantenir l\' escaneig del centimits a metres',
        },
      ],
    },
    {
      heading: 'Per què els esdeveniments anteriors tenien problemes',
      paragraphs: ['En la seva última conferència, l\'empresa havia experimentat errors incòmodes. El cartell de l\'escenari QR va ser generat com un petit PNG i escalat en el programari de disseny - el resultat semblava acceptable des d\'una distància però no ha pogut escanejar amb precisió des del públic. Badgezaire2006. kgm Els QR s\'han sobrepassat i massa petits, frustrants assistents intentant afegir contactes. L\' arranjament incomplet entre formats va significar que \'La meva\' QR en realitat semblava diferent a cada peça.', 'L\'anàlisi post-vent va revelar la causa arrel: cap sola font de veritat. Cada dissenyador havia tornat a crear el QR amb una configuració lleugerament diferent, i cada venedor d\' impressió havia processat fitxers de manera diferent. La qualitat degradada a través del joc telèfon dels dits dels fitxers.'],
      images: [
        {
          src: '/images/examples/print-problems.png',
          alt: 'Fotos de tancament que mostren els errors d\' escaneig: mòduls d\' cartell amb píxel, sota codis de placa de mida, inconsistents entre formats',
          caption: 'Anàlisi proensic dels errors anteriors d\' esdeveniment: cada format havia introduït problemes de qualitat diferents',
        },
      ],
    },
    {
      heading: 'El flux de treball SVG- primer',
      paragraphs: ['Per a aquest esdeveniment, l\' empresa va establir un protocol estricte: un mestre QR generat a l\'ANQR amb arranjaments òptims (R amb la correcció d\' errors H, una zona tranquil· la, neta i exportada com a SVG, i emmagatzemat com a font autoritativa única. L\' enllaç de configuració ANQR ha estat documentat junt amb el fitxer SVG per tal que el codi es pugui regenerar si cal.', 'Cada dissenyador i distribuïdor va rebre el mateix mestre SVG amb instruccions explícites: lloc a la mida requerida, no modificar, mantenir l\'autorització de zona tranquil. Per als proveïdors que requereixen formats de trama, l\'empresa proporcionava PNG en mides específiques amb convencions de noms clars que indiquen utilitzar.'],
      images: [
        {
          src: '/images/examples/print-workflow.png',
          alt: 'Un paquet de fitxers que mostra el mestre SVG, PNG específics de mida, documents d\' especificació i enllaç de configuració',
          caption: 'El paquet de màff: tots els proveïdors necessiten produir resultats consistents sense endevinar',
        },
      ],
    },
    {
      heading: 'Consideracions específiques de mida',
      paragraphs: ['Cada format requereix una atenció específica. El malge insereix al 3cm necessita la QR per ocupar el màxim espai disponible - la distància d\' exploració seria la longitud del braç. Les tendes de taula al 8cm poden incloure un marc de decoració fora de la zona tranquil·la. L\'estendard 4mestre requerit: des de la distància típica de l\'audiència (15-20 metres), els mòduls han de ser clarament indistingibles per les càmeres de telèfon, cosa que significa que el QR havia de ser com a mínim 80cm en el disseny de l\'estendard.', 'La companyia va crear una guia de mida que documentava dimensions mínimes de QR per a cada distància esperada explorant. Això es va convertir en un actiu repetible per als futurs esdeveniments, eliminant el treball endevinable del procés de disseny.'],
      images: [
        {
          src: '/images/examples/print-sizing.png',
          alt: 'Un diagrama que mostra la relació entre la distància d\' escaneig, la mida mínima de QR i el mòdul dimensions per a cada format d\' esdeveniment',
          caption: 'La matriu de mida: calcula dimensions que asseguraven l\' exploració fiable a cada format de la distància esperada de visualització',
        },
      ],
    },
    {
      heading: 'Resultats de la producció',
      paragraphs: ['La validació del dia de la conferència va ser sistemàtica: el personal va provar cada fes servir QR abans d\'obrir les portes. La placa insereix immediatament escanejat a la longitud del braç. Les tendes de taula van treballar amb seguretat en la llum variable d\'habitacions d\'entrada. El cartell de l\'escenari - la vergonya de l\'anterior esdeveniment - es va escanejar amb èxit des de la meitat de l\'àrea del públic.', 'S\' han registrat queixes zeroes a través de 2.000 assistents+. La victòria operacional va ser igualment significativa: quan un patrocinador d\'última hora requereix un nou signe de producció, l\'equip de producció el va generar des del mestre SVG en minuts, segur que coincidirà amb tot el demés.', 'Mireu la guia d\'aprenentatge en codis de QR jack per al marc de decisions SVG contra PNG i les millors pràctiques.'],
      images: [
        {
          src: '/images/examples/print-success.png',
          alt: 'La fotografia d\' esdeveniments mostra els assistents explorant amb èxit codis QR a diverses mides i distàncies a través de l\' adreça',
          caption: 'L\' èxit de la conferència del dia: l\' exploració fiable de tots els formats, des de les notes a la distància de l\' estendard',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=svg#output',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-14',
          label: 'Explora els articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 4: Animated Signage (IDs 1125-1151) =====
    {
      heading: 'Estudi de casos: Pantalla digital de l\' Aeroport',
      paragraphs: ['Aquest exemple segueix una sala d\'aerolínia que havia estat usant codis estàtics a les pantalles de benvinguda digital. Les pantalles que es mostren contingut promocional, però el codi QR per al saló de verificació es troba en una cantonada, estàtic i fàcil ignorant. L\'anàlisi només mostra el 15% dels invitats a l\'hora d\'utilitzar la comprovació QR tot i que sigui més ràpida que la cua d\'escriptori. La majoria dels convidats simplement no se n\'han adonat.', 'La hipòtesi era senzilla: en un entorn ocupat visualment amb contingut en moviment, una QR estàtica es torna invisible. La solució havia de fer que la QR se n\'adonis sense comprometre la fiabilitat necessària per a un flux de xecs on el fracàs significaria viatgers frustrats i cues d\'escriptori més llargues.'],
      images: [
        {
          src: '/images/examples/animated-overview.png',
          alt: 'Una pantalla digital en una sala d\'aeroports que mostra contingut promocional amb un codi QR petit i estàtic a la cantonada',
          caption: 'La configuració original: una QR estàtica perduda en un mar de contingut promocional dinàmic, aconseguint només un 15% d\'adopció',
        },
      ],
    },
    {
      heading: 'Animació segura',
      paragraphs: ['La firma digital de la sala va fer servir grans plafons - un entorn desafiant on l\' animació pot crear problemes d\'escaneig. L\'equip de disseny va començar conservadorament: un suau efecte de pols que s\'expandeix i que reprenqui la presència visual del QR sense modificar l\'estructura del codi actual. El temps del marc s\' ha establert lent (250ms) per evitar qualsevol problema del parpelleig amb la taxa de refresc dels LED.', 'La validació del mode de seguretat confirmada tots els marcs es van quedar escanejats. Les proves addicionals dels plafons LED revelen que el pols necessari és encara més subtil que les vistes prèvies de l\' escriptori suggerides - LED lluminositat i visualització d\' angles afectats es percep més contrast del que s\' esperava.'],
      images: [
        {
          src: '/images/examples/animated-config.png',
          alt: 'El plafó Arranjament de l\' animació ANQR mostra la configuració del pols: temps lent, intensitat subtil, mode de seguretat habilitat',
          caption: 'Configuració de l\' animació: els paràmetres atents a la visualització del plafó LED mentre es manté la fiabilitat de cada marc',
        },
      ],
    },
    {
      heading: 'Integració amb contingut de signes',
      paragraphs: ['La QR animada es va posicionar en una zona de taula dedicada a la disposició de la pantalla - una àrea que va romandre constant mentre el contingut promocional girava a l\' àrea principal de visualització. Aquesta separació era crucial: l\'estabilitat visual QR necessitada per escanejar fins i tot mentre atrauva l\'atenció a través de la seva subtil animació.', 'Name Salta la cua - l\' exploració per comprovar-ho. El text es va mantenir estàtic mentre que el QR polsava, creant una jerarquia visual que va assenyalar l\'ull a l\'oportunitat d\'escaneig sense aclaparador el contingut promocional.'],
      images: [
        {
          src: '/images/examples/animated-layout.png',
          alt: 'Un diagrama de disposició de pantalla que mostra el QR animat en una zona estable mentre el contingut promocional gira a l\' àrea principal',
          caption: 'Assignació de la propietat real de la pantalla: l\' entorn QR animat ocupa una zona estable a part del contingut promocional',
        },
      ],
    },
    {
      heading: 'Desplegament tècnica',
      paragraphs: ['S\' ha exportat el QR animat com a GIF amb paràmetres optimitzats per al CMS. La mida del fitxer tracta - el sistema de gestió de continguts de la sala tenia límits de pujada, i de manera molt grans fitxers causats pel tartamudeig de la reproducció. L\' última exportació visual en contra de la mida del fitxer limitant la paleta de color i optimitzant el comptador de marcs.', 'D desplegament inclou una alternativa: si el GIF ha fallat en jugar per alguna raó, el sistema de signes mostrarà una còpia de seguretat PNG estàtica. Aquesta capacitat de xecs no s\'ha perdut mai degut als problemes tècnics amb l\'animació.'],
      images: [
        {
          src: '/images/examples/animated-cms.png',
          alt: 'Name',
          caption: 'Configuració de Signage CMS: El primari animat amb una alternativa està assegurant que la capacitat de xecs no es interrompi mai',
        },
      ],
    },
    {
      heading: 'Impacte mesurat',
      paragraphs: ['Després d\'un mes d\'operació, l\'adopció de preguntes a QR va augmentar el 15% al 24%, una millora relativa al 60%. Les enquestes de comentaris d\' invitats indiquen que el QR animat era "més bufó per adonar-se" i "felt més modern." Els temps de cua de Desk van disminuir considerablement durant els períodes de pics com a més convidats a reserva mitjançant el QR.', 'D\'acord, hi ha hagut un error d\'escaneig zero malgrat milers de escàners diàries. L\'enfocament d\'animació conservadora havia aconseguit l\'objectiu d\'atenció sense sacrificar la fiabilitat d\'un flux de xecs. La sala va sortir posteriorment semblant a QRs animats a les altres ubicacions.', 'Mireu la guia d\'aprenentatge sobre codis de QR animats per als principis tècnics darrere del disseny d\' animació segur.'],
      images: [
        {
          src: '/images/examples/animated-metrics.png',
          alt: 'Un tauler que mostra l\' augment de la taxa d\'adopció, la reducció del temps de la cua, i la fiabilitat de l\' exploració zero en el període desplegament',
          caption: 'Un mes de dades: augment de l\'adopció del 60% dels temps de cua reduïda, i manté una fiabilitat perfecta de l\' exploració',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&format=gif&animPattern=pulse#animation',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-21',
          label: 'Explora els articles',
          type: 'learn',
        },
      ],
    },

    // ===== Example 5: Cross-Lingual Collaboration (IDs 1152-1178) =====
    {
      heading: 'Estudi de casos: Campanya de llançament global del producte',
      paragraphs: ['Aquest exemple segueix una empresa d\'electrònica de consumidors que inicia un nou producte alhora en 12 mercats a través de 8 idiomes. Cada equip de màrqueting regional necessitava produir empaquetats, pantalles de venda, i materials promocionals amb codis de QR vinculant a pàgines de productes locals. L\' inici anterior s\'havia produït en l\'estructor inconsistent QR styling, ocasionals d\'escanejament, i un joc de \'telephone\' de la deriva de la configuració com cada equip recreava codis de captures de pantalla.', 'La solució va aprofitar els enllaços de configuració a l\'ANR per establir una sola font de veritat que qualsevol equip regional pogués accedir, independentment del llenguatge de la seva interfície. La càrrega QR usada una redirecció intel· ligent que detectava el llenguatge d\' usuari, de manera que un codi treballava globalment mentre proporcionaven experiències locals.'],
      images: [
        {
          src: '/images/examples/collab-overview.png',
          alt: 'Un mapa del món que mostra 12 localitzacions de mercat amb codis QR, alguns inconsistents visualment entre ells',
          caption: 'El repte: 12 mercats, 8 idiomes, i un historial d\' implementació inconsistents QR a través de regions',
        },
      ],
    },
    {
      heading: 'Establir la configuració mestra',
      paragraphs: ['L\' equip de marca global va crear la configuració de QR autoritiu a ANQR: colors de marca que coincideixin amb la identitat visual del producte, la correcció d\' errors H per a la fiabilitat de totes les aplicacions d\' impressió i digitals, i significativament que es reprodueixen consistentment independentment dels mètodes de producció locals. La configuració estava bloquejada i l\'enllaç de compartició documentada en la campanya global breu.', 'Críticament, l\' URL codificat ha usat un servei de redirecció de llenguatge. Quan es va escanejar, els usuaris es van dirigir automàticament a la seva pàgina de producte d\' idioma local. Això significa que tots els 12 mercats podrien fer servir codis de QR idèntics, no hi ha variacions per mercat que puguin introduir errors.'],
      images: [
        {
          src: '/images/examples/collab-master.png',
          alt: 'La interfície ANQR que mostra la configuració mestra amb colors de marca, ECC H, i l\' URL de redirecció intel· ligent',
          caption: 'La configuració mestra: els estàndards de marca globals codificats en una única i compartida de la veritat',
        },
      ],
    },
    {
      heading: 'Un flux de treball d\' equip regional',
      paragraphs: ['Cada equip de màrqueting regional va rebre l\' enllaç de configuració amb instruccions simples: obriu l\' enllaç, verifiqueu que la vista prèvia coincideix amb les directrius de marca, exporta en el format requerit per a la vostra aplicació. La interfície ANQR mostrada en el llenguatge preferit de cada equip, però els paràmetres de QR subjacents es van mantenir idèntics independentment del llenguatge de la interfície.', 'Quan l\' equip japonès necessitava SVG per a pantalles de comerç elevat i l\'equip brasiler necessitava PNG per a les xarxes socials, tant exportades des de la mateixa configuració. Quan el venedor d\' impressió alemany va sol·licitar valors específics de color, podrien fer referència directament a la configuració en comptes de suposar una captura de pantalla.'],
      images: [
        {
          src: '/images/examples/collab-regional.png',
          alt: 'Instantànias mostrant el mateix enllaç de configuració obert en japonès, portuguès i interfícies alemanyesName',
          caption: 'La mateixa configuració, diferents interfícies: els equips regionals treballen en el seu idioma preferit mentre conserva la consistència global',
        },
      ],
    },
    {
      heading: 'Variacions regionals de gestió',
      paragraphs: ['Alguns mercats han demanat adaptació menors. L\'equip xinès necessitava una versió amb un marc vetxat per compartir les xarxes socials. En comptes de modificar el mestre, van crear una variant documentada amb el seu propi enllaç de configuració, clarament etiquetada com a "CN-Chat variant" a la biblioteca activa de la campanya. Això va mantenir la traça mentre permetés la localització necessària.', 'L\' equip de marca va establir una regla simple: qualsevol variació del mestre requeria un nou enllaç de configuració documentat. No hi ha modificacions per exportar fitxers, no hi ha cap correcció ràpida en el programari de disseny. Això evita la deriva de la configuració que havia plagat l\' inici anterior.'],
      images: [
        {
          src: '/images/examples/collab-variants.png',
          alt: 'Una interfície de llibreria d\' actiu que mostra la configuració mestra i les variants regionals, cadascuna amb el seu propi enllaç',
          caption: 'Comportament de l\' actiu de la campanya: configuració mestre més variants documentades, totes traçables mitjançant els enllaços de configuració',
        },
      ],
    },
    {
      heading: 'Resultats de llançament',
      paragraphs: ['El dia de llançament del producte va veure els codis QR utilitzats en l\'empaquetament, pantalles de detall, materials d\'esdeveniments i campanyes digitals en tots els 12 mercats simultàniament. Les audicions de qualitat confirmades amb la consistència visual a través de les regions: la QR en el detall de Tòquio mostra el QR a São Paulo que coincideix amb els cartells de l\'esdeveniment de Berlín.', 'Hi ha hagut errors d\'escaneig zero als mercats. Quan es necessita un canvi d\' URL de la pàgina d\' engegada de producte, el servei de redirecció el va gestionar invisibilitat - no es requereix de re publicació. L\' equip global estimat l\' aproximació de configuració desada 40+ hores de temps de coordinació comparat amb la seva metodologia d\' engegada anterior.', 'Mireu la guia d\'aprenentatge en col·laboració de QRlingüe per als principis del flux de treball darrere de la consistència de campanya global.'],
      images: [
        {
          src: '/images/examples/collab-success.png',
          alt: 'Una graella de fotografies que mostren el QR desplegament consistent a través de diferents mercats: Client de Tòquio, empaquetament de São Paulo, esdeveniments de Berlín',
          caption: 'S\'ha aconseguit la consistència global: presentació idèntica a QR a través de 12 mercats, malgrat diferents idiomes, proveïdors i formats',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#share',
          label: 'Obre el generador',
          type: 'generator',
        },
        {
          href: '/learn?lang=${lang}#section-28',
          label: 'Explora els articles',
          type: 'learn',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
    { href: '/guide?lang=${lang}', label: 'Obre la guia completa d\' usuari', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Obre la galeria', type: 'gallery' },
  ],
};
