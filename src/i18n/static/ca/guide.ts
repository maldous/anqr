import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'Guia d\'usuari ANQR',
  description: 'Guia completa per a crear codis QR.',
  lastUpdated: '1 de febrer de 2026',
  breadcrumb: ['Guia'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: 'Començar',
      paragraphs: ['ANQR és un generador de codi QR amb un primer enfocament del client. Per omissió, els codis QR es generen localment al vostre navegador, no es requereix cap compte i les vostres dades es mantenen privades. Per a la incrustació professional, també podeu usar l\' API del servidor.', 'La interfície té tres nivells d\' interfície: Bàsic, Avançat i Professional. Seleccioneu el nivell usant les pestanyes de la capçalera. Cada nivell desbloqueig característiques addicionals mentre manté la interfície centrada en el que necessiteu.'],
      bullets: ['Bàsic: creació de codi QR amb contingut pla de text/ URL i recobriment d\' imatge.', 'Avançat: Opcions de codificació QR, els estils de representació, animació, formats de sortida, tipus de contingut ampliat, i recobriment de la personalització.', 'Professional: Marca d\' aigua, metadades, compartició, anàlisi de seguretat, codis de pagament QR, i característiques empresarials.'],
      links: [{ href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' }],
    },
    {
      heading: 'Inici ràpid',
      paragraphs: ['Per crear el vostre primer codi QR:'],
      bullets: ['1. Seleccioneu un tipus de contingut (URL, text, WiFi, etc.) des del tipus de contingut desplegable.', '2. Introduïu les dades en els camps proporcionats.', '3. De forma opcional de personalitzar els colors, els estils i afegiu una imatge de recobriment.', '4. Cliqueu Exporta per a descarregar el codi QR com PNG, GIF, WebP, o SVG.'],
      links: [{ href: '/?lang=${lang}', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    // Basic Features (sections 2-4)
    {
      heading: 'Característiques bàsiques',
      paragraphs: ['El nivell bàsic proveeix una interfície de corrent per crear codis QR amb contingut de càrrega i recobriment d\' imatges. Aquesta és la manera més senzilla de començar.'],
      links: [{ href: '/?lang=${lang}&tab=basic', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Tipus de contingut (Basic) Name',
      paragraphs: ['Text pla: Codifica qualsevol text fins al límit del codi QR. Ideal per missatges curts, codis o identificadors.', 'URL: Codifica les adreces web. El codi QR obrirà l\' URL en explorar. Suports http:// i https: // protocols.'],
    },
    {
      heading: 'Imatge sobrecobriment (Basic)',
      paragraphs: ['Carrega una imatge (JPG, PNG, GIF, WebP) per a barrejar- se amb el codi QR. Les característiques bàsiques del recobriment inclouen:'],
      bullets: ['Puja des del fitxer: Seleccioneu una imatge del dispositiu.', 'Carrega des d\' URL: Introduïu un URL d\' imatge (ha de permetre el CORS).', 'Centre Logotip: Posa la imatge al centre, confiant en la correcció d\' errors.', 'Barreja: barreja d\' imatge simple alfa amb patró QR.', 'Intensitat: Controla el gran recobriment afecta al codi QR (0. 100%).', 'Mode de color: Color complet, escala de grisos, o blanc i negre.', 'Preserva els patrons de recerca: Manté els patrons de les cantonades sense modificar per a l\' exploració fiable.'],
      links: [
        { href: '/?lang=${lang}&tab=basic#overlay', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: 'Característiques avançades',
      paragraphs: ['Les opcions avançades de codificació de nivell desbloqueja l\' QR, els estils de representació, animació, formats de sortida, tipus de contingut ampliat, i personalització avançada del recobriment.'],
      links: [{ href: '/?lang=${lang}&tab=advanced', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Arranjament de la codificació QR',
      paragraphs: ['Versió: els codis QR entren en versions 1-40, amb versions més altes, però són més grans. Estableix fins a 0 (auto) per a deixar que ANQR triï la versió més petita que s\'ajusti al vostre contingut.', 'Correcció d\' errors: Determina quant de dany es pot mantenir un codi QR mentre queda escanejat.'],
      bullets: ['L (Límia: 7% d\' errors de correcció d\' errors - mida més petita, menys redundància.', 'M (modi): 15% de correcció d\' errors - Opció equilibrat.', 'Q (Quartile): Correcció d\' error del 25% - Bé per codis impresos.', 'H (Ressalta): Correcció d\' error del 30% - millor per codis amb recobriment o en condicions dures.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#qr-encoding', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Zona tranquil (margin)',
      paragraphs: ['La zona tranquil·la és l\'espai blanc al voltant del codi QR. Els escàners necessiten aquest marge per a detectar on comença el codi. L\'estàndard recomana almenys 4 mòduls. La reducció de sota 4 pot causar problemes d\'escaneig.'],
    },
    {
      heading: 'Estil del mòdul',
      paragraphs: ['Els mòduls són els quadrats individuals que composen un codi QR. ANQR ofereix cinc estils:'],
      bullets: ['Quadrat: aparença clàssica de QR amb cantonades afilades.', 'Arrodonit: Cantonades suaus per a una mirada més maca.', 'Punts: Mòduls circulars per a una estètica moderna.', 'Diamant: 45° girant quadrats per a un patró distintiu.', 'Connectat: Mòduls de fusió quan adjacent, creant formes orgàniques.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Estil del patró de cerca',
      paragraphs: ['Els patrons de recerca són els tres quadrats grans a les cantonades QR que ajuden a escàners d\'ajuda o desxifrar el codi. Estils disponibles:'],
      bullets: ['Quadrat: cantonades quadrades estàndard.', 'Arrodonit: Cantonades suaus que coincideixin amb l\' estil del mòdul arrodonit.', 'Cercle: patrons de cerca circulars per codis d\' estil complet.'],
    },
    {
      heading: 'Patrons d\' alineament i Timing',
      paragraphs: ['Els patrons alineament apareixen en codis de QR més grans (versió 2+) per ajudar a la distorsió correcta. Els patrons amb el temps són les línies alternants que connecten els patrons de cerca.'],
      bullets: ['Estil de l\' alineament: coincidència amb Cercador, Quadrat, Rounded, o cercle.', 'Estil del Timing: Concorda el mòdul, Solid, o Dashot.'],
    },
    {
      heading: 'Colors',
      paragraphs: ['Primer pla: El color dels mòduls QR. El negre (# 000) és estàndard, però qualsevol color fosc funciona.', 'Fons: El color de fons. Blanc (#ffff) és estàndard. Assegureu- vos del contrast suficient amb el primer pla.', 'Fons transparent: Elimina el fons totalment per a usar en superfícies acolorides. Assegureu-vos que la superfície proveeix un contrast adequat.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Mida del mòdul i Gaap',
      paragraphs: ['Mida del mòdul: Controla com de gran es mostrarà cada mòdul en píxels. Els valors més grans creen codis més grans, més fàcils d\'escanejar.', 'Gap del mòdul: Afegeix espai entre mòduls com a percentatge. Petits llocs buits (15%) poden millorar l\'escannerabilitat en algunes condicions, però reduir la fiabilitat excessiva dels buits.'],
    },
    {
      heading: 'Arranjament de sortida',
      paragraphs: ['Format: Seleccioneu el format d\' exportació basat en el cas d\' ús.'],
      bullets: ['PNG: format de trama sense pèrdua, ideal per a la majoria d\' usos. Millor per a imprimir i digital.', 'WebP: Format modern amb mides de fitxers més petites. Bé per l\'ús web.', 'GIF: Es requereix per codis QR animades. Suporta transparència.', 'SVG: format vectorial que escala infinitament. Millor per a una gran impressió o quan necessiteu editar el codi.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#output', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-3', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    {
      heading: 'Dimensions de la sortida',
      paragraphs: ['Amplada/alçada: Estableix la mida de la sortida en píxels. Per a imprimir, calculeu en DPI (p. ex., 300 PPP a 1 polzada = 300px). La mida més gran escaneja amb més precisió a la distància.'],
    },
    {
      heading: 'Arranjament d\' animació (avançada)',
      paragraphs: ['Controleu el comportament del codi QR animat:'],
      bullets: ['Velocitat: taxa del marc d\' animació en mil· lisegons.', 'Bucle: animació contínua o regles.', 'Direcció d\' animació Ping-pong.', 'Comença el marc: Comença l\' animació des del marc específic.', 'Màx. de marcs: Limita els marcs totals d\' animació.', 'Pas del marc: Salta els marcs per a una animació més ràpida.', 'Interpolació: Cap, Creuad, o Morph entre marcs.'],
      links: [
        { href: '/?lang=${lang}&tab=advanced#animation', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    {
      heading: 'Tipus de contingut (Avançat)',
      paragraphs: ['El nivell avançat desbloqueja formats addicionals de càrrega de pagament:'],
      bullets: [
        'Número de telèfon (tel:): Crea un enllaç de telèfon callable.',
        'Correu electrònic (mailto:): Obre el client de correu amb un assumpte opcional i cos.',
        'SMS: Missatge de text complet a un número de telèfon.',
        'vCard: Targeta de contacte completa amb nom, organització, telèfon, adreça de correu electrònic.',
        'MeCard: Compacta el format de contacte popular al Japó.',
        'BizCard: Format de targeta de negocis heretat.',
        'Localització Geo: Coordenades GPS que obren en mapes.',
        'WiFi: Unitats de xarxa per a la connexió automàtica (SSID, contrasenya, tipus de seguretat).',
        'Esdeveniment de calendari: Format iCalendar amb títol, localització, data/ hora.',
        'Esdeveniment RCSV: Enllaç a la pàgina de registre d\' esdeveniments.',
        'Subscriure el calendari: Subscriu- vos a una font ICS/WebCal.',
        'URL de fitxer/ document: enllaç directe per a descarregar fitxers.',
        'Enllaç d\' emmagatzematge del Cloud: enllaços a Google Drive, Dropbox, OneDri, etc.',
        'Perfil social: Enllaços a LinkedIn, Twitter, Instagram, etc.',
        'Enllaç de missatgeria: WhatsApp, Telegram, enllaços de senyal profund.',
      ],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Característiques avançades sobreverlay',
      paragraphs: ['Capacitats de recobriment addicionals:'],
      bullets: ['Escapça: Habilita l\' escapçat per seleccionar una regió quadrada de la imatge.', 'Semi to: Clàssic patró d\' estil d\' impressió basat en la brillantor de la imatge.', 'Difuminat: tramat d\' error per a la reproducció detallada.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#overlay', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Modes de barreja de sobrelay (avançats)',
      paragraphs: ['Modes de barreja addicionals en el nivell avançat:'],
      bullets: ['Subpíxels: divideix cada mòdul en subpíxels per a detall superior.', 'Soroll blau: Usa tramat de soroll blau per a patrons sense artefacte.', 'Mosaic: efecte basat en mosaic preservant l\' estructura d\' imatges.', 'Espai de color: Posa la imatge en llocs buits entre els mòduls.', 'Brillantor: Mida del mòdul Vers basat en la brillantor de la imatge.', 'Duo to: Imatge de mapes a dos colors per a un contrast sorprenent.'],
    },
    {
      heading: 'Intensitat del sobrecobriment',
      paragraphs: ['Controla com afecta el recobriment del codi QR (0-100%). Els valors més alts mostren més detalls de la imatge però poden reduir l\' escaneig. Comenceu al voltant del 70% i ajusteu a les proves.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Mireu guies i exemples relacionats', type: 'learn' }],
    },
    {
      heading: 'Mode de color',
      paragraphs: ['Com es processa el recobriment de la imatge:'],
      bullets: ['Color complet: Preserva els colors originals de la imatge.', 'Escala de grisos: Converteix als tons negres i negres.', 'Blanc i negre: Conversió binària d\' alt contrast.'],
    },
    {
      heading: 'Preserva els patrons de recerca',
      paragraphs: ['Quan està habilitat, manté els tres patrons de la cantonada sense modificar pel recobriment. Ben recomanat per escanejar fiables.'],
    },
    {
      heading: 'Preprocessat d\' imatge',
      paragraphs: ['Aplica els filtres a la vostra imatge de recobriment abans de barrejar- se. Aquests ajustaments poden millorar com apareix la imatge en el codi QR final.'],
      bullets: ['Brillantor (100 a +100): Il· luminació o fosc en la imatge.', 'Contrast (100 a +100): Augmenta o disminueix l\' interval tonal.', 'Gamma (0. 2 a 3. 0): Ajust de brillantor no lineal. Els valors per sota d\'un to alleugeritiu, més d\'un fosc.', 'Saturació (100 a +100): Intensitat del color. -100 és escala de grisos, +100 s\'atura.', 'Gira de matí (0-360°): Desplaça tots els colors de la roda de color.', 'Difuminat (0. 20px): Obre els detalls de la imatge.', 'Aguditza (0-100%): Augmenta les vores i els detalls.', 'Cartellitza (0- 16 nivells): Redueix els nivells de color per a un efecte de pòster.', 'Llindar (0- 255): Converteix a negre/ blanc binari al punt de tall.', 'Detecció de la vora: Sobel o d\' algorismes Cany per a mostrar només les vores.', 'Inverteix: invers tots els colors.'],
    },
    {
      heading: 'Mode d\' ajust',
      paragraphs: ['Com la imatge de recobriment obre l\' àrea de codi QR:'],
      bullets: ['Coberta: la imatge omple tota l\' àrea, l\' escapçat si cal.', 'Conté: visible tota la imatge, pot tenir marges.', 'Amplia: la imatge distorsiona per omplir exactament.'],
    },
    {
      heading: 'Opcions de transformació',
      paragraphs: ['Gir: girar el gir a 90° increments.', 'Inverteix X/Y: Mira la imatge horitzontal o verticalment.'],
    },
    {
      heading: 'Algorismes de tramat',
      paragraphs: ['La fusió converteix imatges de to continu en patrons que els codis QR poden representar. Disponibles quan s\' usa els modes de mescla blau o Cert.'],
      bullets: [
        'Error de Diffussió: estil clàssic Floyd- Steinberg. S\' ha produït un error en la quantització dels píxels veïns.',
        'Ordenat (Baider): Usa una matriu de llindar per a patrons regulars.',
        'Punt seguit: Simula la impressió mitjana de to.',
        '& Clúster Voide: Difusió ordenada optimitzada.',
        'Soroll blau: Name.',
        'Soroll blau Llindar: Difusió de llindar amb textura de soroll blau.',
        'Soroll de blanc: tramat de llindar aleatori.',
        'Gaussià/Triangular Soroll: Soroll amb distribucions diferents.',
        'Soroll blau + error Diffusion: Híbrid combina ambdues tècniques.',
        'Soroll de color blau mostrat: patró de soroll blau de pantalla.',
        'Perceptual: Luminància per obtenir millors resultats visuals.',
        'Per a la vora, sempre resta les vores de la imatge durant el tramat.',
        'Llindar adaptatiu: Llindar adaptatiu localment.',
        'Soroll de blau temporal: Per als GIF animades, varia el patró per marc.',
      ],
    },
    {
      heading: 'Nuclis de diferències',
      paragraphs: ['Quan s\' usa un tramat d\' error diffusion, escolliu com es distribueix l\' error:'],
      bullets: ['Disfusió clàssica de 4abor. Bona tria general.', 'Jarvis-Judice-Ninke: 12nahbor, més suau però més lent.', 'Stucki: Similar a JJN amb pesos diferents.', 'Burke: JJN, més ràpid.', 'Sierra: Família dels nuclis de qualitat i velocitat.', 'La difusió de la llum, preserva el detall, però pot ser graciós.'],
    },
    {
      heading: 'O força',
      paragraphs: ['Controla quant s\' aplica el tramat (0-100%). Baixa els valors conservats més del patró original, els valors més alts mostren més detalls de la imatge.'],
    },
    {
      heading: 'Arranjament del subpíxel',
      paragraphs: ['Quan s\' usa el mode de mescla de subpíxels:'],
      bullets: ['Mida de la graella: 2×2, 3×3, o 4×4 subpíxels per mòdul. Més alt = més detall.', 'Regla del centre: estrictament requereix que el subpíxels central coincideixi amb el mòdul. El centre semi to permet variació.', 'Color neutre: Color usat per subpíxels sense determinar.', 'Sobreescriu el cercador: Com es mostren els patrons de cerca (Solid o Stylitzades).'],
    },
    {
      heading: 'Arranjament semi to',
      paragraphs: ['Quan s\' usa el mode de mescla semi to:'],
      bullets: ['Mida de la cel· la: Per mòdul o graella N×N.', 'Forma de punt: Cercle, Quadrat, o línia.', 'Corba de lluminositat: lineal, S- Purve, o Gamma.'],
    },
    {
      heading: 'Colors de Duo to',
      paragraphs: ['Quan s\' usa el mode de mescla de graus, establiu el color de l\' ombra ( àrees fosques) i el color ressaltat (línies de graus).'],
    },
    {
      heading: 'Arranjament d\' animació del GIF',
      paragraphs: ['En usar recobriments animats del GIF:'],
      bullets: ['Usa els retards del marc: respecte el temps original GIF.', 'Màxim FPS: Taxa de fotogrames (1- 60 fps).', 'Gestió general: El respecte o els mètodes de marc Simplifiqueu.'],
    },
    {
      heading: 'Opcions avançades de renderització',
      paragraphs: ['Controls de representació addicionals:'],
      bullets: ['Mode Gap: Cap, Inset, Tatxat, o buit negatiu de l\' espai.', 'Radi de cantonada: Percentatge de cantonades arrodonides pels mòduls.', 'Degradat: Cap, lineal, Radial, o gradient de cònica dels mòduls.', 'Estil de l\' ocular/Inner: styling Independent per a anells de patró.', 'Rotació del punt: Gira els mòduls de diamant/dot.', 'Escala d\' ull: Ajusta la mida per als patrons de cerca.', 'Estil del marc: Afegeix marcs de decoració (estructurat, pals, etiqueta).', 'Text del marc: Afegeix text com "Em pot!" als marcs.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#render', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Codificació avançada QR',
      paragraphs: ['Codificació QR d\' ajust fi:'],
      bullets: ['Mode de codificació: Auto, numèric, Alfanumèric, bytes/UTF- 8, o Kanji.', 'Força la zona mínima de silenci: Assegureu- vos almenys 4 mòdul.', 'Patró de màscara: Auto (optmal), o seleccioneu manualment patrons 0- 7 per a controlar la distribució del mòdul. Diferents patrons creen aparences visuals diferents en codificar les mateixes dades.', 'Codificació dels caràcters: ISO- 8859- 1 (per omissió de Latin- 1), UTF- 8 (amplada Unicode incloent emoji), o Maj-JIS (Jap). Escolliu basat en els requeriments de caràcters del contingut.'],
    },
    {
      heading: 'Opcions avançades de sortida',
      paragraphs: ['Arranjaments addicionals d\' exportació:'],
      bullets: ['Nom de fitxer: Nom de fitxer personalitzat per a les baixades.', 'GIF Mida de la paleta: 2- 256 colors a la sortida GIF.', 'GIF Quantador: Talla mediana, NeuQuant, o reducció de color d\' octarree.', 'GIF Tramat: Fora, Floyd- Steinberg, o ordenat.', 'GIF Color transparent: Estableix un color per a ser transparent.', 'SVG Vector real: Usa camins enlloc de la trama encastada.', 'SVG Precisió de la forma: Píxel o representació de les rutes d\' aprenentatge.', 'SVG Embed Raster Overlay: Inclou el recobriment com a imatge encastada.', 'Fons Sobreescriu: Força un color de fons específic de la sortida.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#output', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opcions de validació',
      paragraphs: ['Arranjaments del processament d\' entrada:'],
      bullets: ['Valida l\' entrada: Comprova el format de contingut abans de la codificació.', 'Espai en blanc del Trim: Elimina els espais inicials/ trailing.', 'Normalitza les noves línies: Converteix tots els finals de línia a LF.', 'Gestor màx. de longitud: Avisa si el contingut supera la capacitat QR.'],
    },
    // Professional Features (sections 41-56)
    {
      heading: 'Funcionalitats professionals',
      paragraphs: ['El nivell professional afegeix marques d\'aigua, metadades, opcions de compartició, anàlisi de seguretat, codis de pagament QR i característiques empreses.'],
      links: [{ href: '/?lang=${lang}&tab=professional', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Marca d\' aigua',
      paragraphs: ['Afegeix marques d\' aigua als codis de QR:'],
      bullets: ['Classe: Text, imatge, o patró marca d\' aigua.', 'Posició: centre, cantonades, vores, Darrere o Zona silenciosa.', 'Opacitat: transparència de la marca d\' aigua (0. 100%).', 'Mode de barreja: Normal, Multiply, Screen, o Overlay mesclant.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#watermark', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Metadades',
      paragraphs: ['S\' estan escrivint les metadades en fitxers exportats:'],
      bullets: ['Títol, Autor, Copyright, llicència, camps de descripció.', 'Hora de creació: marca de temps de generació de l\' espai de temps.', 'Valor personalitzat de clau: Afegeix parelles de metadades arbitràries.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#metadata', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
      ],
    },
    {
      heading: 'Compartició',
      paragraphs: ['Compartiu les vostres configuracions de codi QR:'],
      bullets: ['Enllaç directe: Genera un URL compartit amb la configuració actual.', 'Embed HTML: Obté codi d\' incrustació per a llocs web.', 'Paràmetres de codificació: Inclou tots els arranjaments de l\' URL de compartició.', 'Nota: no es poden compartir imatges d\' un fitxer local via URL.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#share', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-7', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    {
      heading: 'Anàlisi de seguretat',
      paragraphs: ['Assegureu- vos que els codis QR segueixen sent escanejats:'],
      bullets: ['Mode de seguretat: inactiu, balançat, o requeriments d\' exploració estrictament.', 'Mòdul mínim Mida: Mida mínima del píxel per mòdul.', 'Silenciut Zona: Mòdul mínim del marge.', 'Bloqueja els Cercadors/Timing/Align/Format/ version: Protegeix els elements específics.', 'Intensitat màxima de sobrecobriment per ECC: límits d\' intensitat automàtica basats en el nivell de correcció d\' errors.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#safety', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-5', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    {
      heading: 'Tipus de contingut (profesal)',
      paragraphs: ['Nivell professional afegeix tipus de contingut de pagament i empresa:'],
      bullets: ['CPC/SEPA (EU): Transferència de banc europeu QR codis amb IBAN, BIC, quantitat, referència.', 'Comment.', 'PayNow (Singapur): El pagament ràpid de Singapur amb el número UEN o mòbil.', 'PreguntaPay (Thailand): Sistema de pagament nacional tailandès.', 'PIX (Brasil): Pagament instantani brasiler amb la tecla PIX.', 'Bitcoin: Bitcoin, Ehim, adreces del pagament Litacoin amb una quantitat opcional.', 'Enllaç de campanya de mercat: URL amb un paràmetre complet d\' etiquetes UTM (Marxing) seguiment.', 'Enllaç curt: Per usar- los amb els curts d\' URL per a codis dinàmics/ pistables QR.', 'Enllaç GS1 digital: Identificació de producte amb GTIN, sèrie, lot, expiració.', 'A l\'aplicació de l\' enllaç profund: l\' aplicació iOS/ Iroide amb enllaços personalitzats.', 'Format personalitzat: Dades RAW sense format ni validació.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-2', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: 'Idioma- Pagaments propers en mode avançat',
      paragraphs: ['Quan s\' usa el mode avançat, ANQR mostrarà automàticament els mètodes de pagament rellevants per al vostre idioma seleccionat. Per exemple, els usuaris vietnamites veuen VietQR, els tailandesos veuen l\'etiqueta Pay, i els usuaris de llengües índies veuen l\'keI i BharatQR. Els mètodes de pagament global (crirectiu, PayPal, App) estan disponibles per a tots els idiomes. El mode professional desbloqueja tots els estàndards de pagament independentment del llenguatge.'],
      links: [{ href: '/?lang=${lang}&tab=advanced#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pagaments europeus',
      bullets: ['ECP/SEPA (EU): Transferència de codis de banc europeu QR després del codi QR del CCP QR estàndard. El suport IBAN, BIC (opcional per a l\'interior), quantitat en la UE, estructurat o referències de pagament no estructurats. Utilitzada a través de la zona SEPA, incloent-hi els països de la UE més Suïssa, Noruega, Islàndia, Liechtenstein, Mònaco, i San Marino.', 'QR-bill: Pagament estàndard suïssa seguint la guia d\'execució de l\'SIS. Implementació de CHF i EUR, QR-Reference (QRR), Referència de crèdit (ISO 1164), adreces de crèdit i informació de llei. Es requereix per als suïssos des de 2022.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pagaments indis',
      bullets: ['UPI (Índia): Interfície de pagament unificat després de l\' especificació d\' enllaç NPCI. Contribueix el directorA (L\' adreça de pagament virtual), el nom dels beneficiaris, la quantitat en la R, la nota de transacció, l\' ID de referència, el codi de categoria mercant i el mode de transacció.', 'BharatQR (Índia): Unificada l\' estàndard QR de suport tant en les dues cartes com als pagaments basats en les targetes. Combina la vicepresidentA amb la targeta PA per compatibilitat màxima. Inclou el nom del mercader, la ciutat, el MCC, els detalls GST i els números de referència.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Per tant, el sud-est asiàtic paga estàndard',
      bullets: ['PayNow (Singapur): Sistema de pagament ràpid de Singapur usant l\' especificació EMVCo QR amb el perfil SGQR. Implementació de l\' UEN ( registre de la propietat), número mòbil o NRIC com a identificadors d\' intermediari. Inclou la bandera d\' edició i venciment de la data.', 'PreguntaPay (Thailand): El sistema de pagament nacional tailandès segueix el Banc d\'EMV. El número de telèfon mòbil, ID nacional, identificació fiscal, ID de l\'ewallet i pagament de llei amb múltiples camps de referència.', 'QIS (Indonesia): Codi ràpid de Resposta indonesi. L\'estàndard de pagament nacional basat en el qual permet l\' ID del mercader, NMID (Identificació de prànties), classificació dels criteris mercants, i despeses de conveniència (valorats o percentatge).', 'El sistema de pagament instantani de Malàisia. Funciona amb diversos tipus d\' intermediari incloent NRIC, mòbil, passaport, ID de l\'exèrcit i números de registre de l\' empresa.', 'VietQR (Vietnam): estàndard de transferència interbank vietnamès. Requereix un banc BIN (identificador DELPAS) i número de compte. Implementació de múltiples codis de serveis per a diferents tipus de transferència (QRPUSH, QRITTTAR, QRITTC).', 'QR Ph (Filipines): L\'estàndard de pagament filipí per I\'Insta Pay i PPONet. Usa els números de compte amb identificació del mercader per a les transaccions P2M (personant).'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pagaments a l\' est d\' Àsia',
      bullets: ['TWQR (Taiwan): estàndard del pagament taiwanià. Suporta l\'identitat del mercader, la identificació dels impostos i la quantitat de TWD.', 'HKQR/FPS (Hong Kong): Codis del sistema QR de Hong Kong més ràpid. Implementació de FPS ID, número mòbil, o correu electrònic com a identificadors de pagament. Imports en HKD.', 'JPQR (Japó): L\' estàndard del pagament del codi unificat japonès QR. Usa l\' ID de la identificació del mercader amb quantitats de JPY.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Altres estàndards de pagament regional',
      bullets: ['PIX (Brasil): Sistema de pagament instantània del Banc Central Brasil seguint l\' especificació del codi BR. Funciona amb tecles PIX (CPF, CNPJ, correu electrònic, telèfon o clau aleatòria), nom/city, ID de transacció i quantitat BRL.', 'AusPayNet/NPPP PayID (Austràlia): Sistema de pagament australià Nova plataforma PayID. Paga Tipus d\' ID (Mail, mòbil, ABN, ID d\' organització) o el tradicional BSB + número de compte. El nom de Merchant és opcional com els pagadors veuen el nom registrat a la cerca de NPP.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Pagaments d\' encriptatge',
      bullets: ['Bitcoin/Litecoin (BIP-21): URI de pagament estàndard de criptografia amb adreça de cartera, quantitat opcional i etiqueta. Compensable amb tots els millors bitcoins i carteres Litecoin.', 'Comment El pagament de la xarxa de Llamp avoices. Enganxa una cadena de televisió BOLT11 codificada per a pagaments instantanis de Bitcoin amb taxa mínima.', 'Hi haum (EIP- 681): Els URI de sol· licitud de transaccions que permeten transferències natives i transferències de fitxa ERC-20. Inclou l\' ID de cadena per al suport multi- network (Mainnet, polígon, BSC, Arbitrum, Opèmisme, Avalanche), paràmetres de gas i crides a funcions de contracte.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Serveis d\' enllaç monetaris',
      bullets: ['PayPal.Me: PayPal links per al pagament amb nom d\' usuari i una quantitat opcional pre- plena. Els destinataris poden pagar per balanç de PayPal, targetes o comptes bancaris.', 'Efectiu: Els enllaços de pagament de l\' App usant l\' etiqueta $cash amb una quantitat opcional. Popular als Estats Units per pagaments entre iguals.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Genèric ESMV QR',
      bullets: ['ESMV Genèric: Crea mode personalitzat EMV de Centhhant-Preent Codis QR per als esquemes de pagament no llistat específicament. Configureu el nom del mercader, ciutat, codi del país (ISO 3166- 1), codi de moneda (ISO 4217 numèric), MCC, opcions de quota de tip/convenència, i camps de dades addicionals. És útil per a provar o integració personalitzada.'],
      links: [{ href: '/?lang=${lang}&tab=professional#payload', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: 'Modes de barreja de sobrelay (profesicional)',
      paragraphs: ['Modes de barreja addicionals a nivell professional:'],
      bullets: ['Píxela: efecte de recobriment píxel.', 'Contorn: recobriment de la detecció de les vores mostra només els contorns.', 'Efecte de distorsió Wabut.', 'Mida del subpíxel: subpixel variable basat en la imatge.', 'Cert O bé: tramat avançat amb selecció de matriu ordenada.', 'Extrem: visibilitat màxima de la imatge, pot afectar l\' escaneig.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Arranjament de protecció',
      paragraphs: ['Control fi marcat sobre el qual els elements QR estan protegits des de la modificació del recobriment:'],
      bullets: ['Preserva el temps: Mantén els patrons de temps sense modificar.', 'Preserva l\' alineament: Mantingueu els patrons d\' alineació sense modificar.', 'Protegeix el format Informació: mòduls de format d\' informació d\'escuts.', 'Protegeix la versió Informació: mòduls de versió d\'escuts.'],
    },
    {
      heading: 'Mode ECC- Aware',
      paragraphs: ['El recobriment intel· ligent distribueix la intensitat basada en la capacitat de correcció d\' errors. El sistema analitza quins mòduls es poden modificar mentre es manté l\' escaneig.'],
      bullets: ['Any següent.', 'Un pressupost més alt és el recobriment visible però més arriscat.', 'Baixa el pressupost = l\' exploració més segura però menys un recobriment visible.'],
      links: [{ href: '/?lang=${lang}&tab=professional#overlay', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opcions de renderització professional',
      paragraphs: ['Controls avançats de representació:'],
      bullets: ['Cantonades Crisp: Usa la renderització d\' imatges amb píxels per a vores de mòdul sostinguts.', 'Pixela: Flo, Round, o alineament de píxels Celil.', 'Mode de color Per- Module: Sòlid, Per brillantor, per posició, Per Overlay, Per Cúmul.', 'Paleta del color: Defineix una paleta de color personalitzada per a colors de mòduls.', 'Vigilant de contrast: Assegureu- vos de la proporció mínima de contrast entre colors.', 'Relació mínima de contrast: requisit de contrast a l\' estil WCAG (1: 1 a 21: 1).', 'Vora extra Mòduls: Vora addicional més enllà de la zona tranquil.'],
      links: [{ href: '/?lang=${lang}&tab=professional#render', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Opcions de sortida professional',
      paragraphs: ['Arranjaments d\' exportació a l\'Enterprise:'],
      bullets: ['DPI: establiu la resolució d\' impressió (72- 600 PPP). 300 PPP recomanat per a imprimir.', 'Zona horària: Commuta la zona tranquil· la en les dimensions de sortida.', 'Exporta com a addicional: Genera PDF junt amb el format primari.'],
      links: [{ href: '/?lang=${lang}&tab=professional#output', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Paràmetres d\' animació (propiació)',
      paragraphs: ['Funcionalitats d\' animació professionals addicionals:'],
      bullets: ['O bé Temporal: Off, Soroll blau, o Flider Safe per tramat Childframe.', 'Patró: Cap, Puls, Wave, Scanline, Shimmer, o efectes Drift.'],
      links: [
        { href: '/?lang=${lang}&tab=professional#animation', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' },
        { href: '/learn?lang=${lang}#section-4', label: 'Mireu guies i exemples relacionats', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API Referència',
      paragraphs: ['ANQR proporciona una API al costat del servidor per generar codis QR via paràmetres URL. Això és ideal per incrustar codis QR en llocs web, correus, documents, o fluxs de treball automatitzats sense JavaScript al client.', 'URL base: https://anqr.link/api/qr'],
      links: [{ href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' }],
    },
    {
      heading: 'Paràmetres bàsics',
      paragraphs: ['Els paràmetres requerits i comuns (els noms dels paràmetres no es tradueixen):'],
      bullets: ['dades (requerit): El contingut a codificar en el codi QR. Caràcters especials del codi URL.', 'mida: Mida de la imatge en píxels (per defecte: 400, max: 2000). Usat si no s\' ha especificat w/h.', 'w, h: amplada i alçada de sortida en píxels. Rectifica el paràmetre de mida.', 'format: Format de sortida - png, webp, o gif (per omissió: png).', 'ec: Nivell de correcció d\' errors - L, M, Q, o H (per omissió: H).', 'fg: color de primer pla com a hexadecimal sense # (per omissió: 000000).', 'bg: Color de fons com a hexadecimal sense # (per omissió: ffffff).', 'transparent: establert a 1 per al fons transparent.', 'marge: Zona horària en mòduls (per omissió: 4).'],
    },
    {
      heading: 'Paràmetres d\' error',
      paragraphs: ['Mòdul i mida de patró:'],
      bullets: ['estil: Mòdul - Quadrat, arrodonit, punts, diamant, connectat.', 'finder: Estil de patró Cercador - quadrat, arrodonit, cercle.', 'estil de patró alineament - coincidència_finder, quadrat, arrodonit, cercle.', 'temps de temps: estil del patró de Timing - coincidència_ mòdul, sòlid, punts de punts.', 'radi: radi del vèrtex percentatge 0- 100.', 'interval: salt del mòdul percentatge 0- 50.', 'mode de salt: Mode Gap - cap, inici, apoplexia, negatiu_ espai.', 'ull Outer, visualInner: estils d\' ull - plaça, arrodonit, cercle.', 'kScale: Percentatge d\' escala d\' ull (per omissió: 100).', 'graduat: tipus de degradat - cap, lineal, radial, cònica.', 'graduat Agle: Angle degradat per degradats lineals.', 'el graduat s\' atura: el degradat s\' atura com a color1,pos1, color2,pos2,pos2,... (p. ex., ff0000, 000ff, 1).'],
    },
    {
      heading: 'Paràmetres de recobriment',
      paragraphs: ['Opcions de recobriment d\' imatge (la imatge de sobrelay s\' ha recuperat la imatge al servidor):'],
      bullets: ['imag: URL a recobriment de la imatge (ha de ser accessible públicament).', 'mode: Mode de sobrelay - centre, meitat to, mescla, brillantor, mosaic, tramat, blau- nois, subpíxel.', 'intensitat: Intensitat de sobrecobriment 0- 100 (per defecte: 100).', 'color Mode: Mode de color de sobrelay - color, escala de grisos, bw.', 'encaixa: Com s\' ajusta el recobriment - cobreix, conté, estirar.', 'rot: sobrela rotació en graus.', 'giratX, girY: Estableix a 1 per girar el recobriment.', 'conserva Cercadors: Preserva els patrons de cerca (per omissió: 1).', 'conserva Timing, keepAlign: Establir- lo a 1 per preservar els patrons de temps i reajustament.'],
    },
    {
      heading: 'Paràmetres de preprocessació',
      paragraphs: ['El preprocessament d\' imatges s\' ha aplicat al recobriment:'],
      bullets: ['brillantor: Ajust - 100 a 100 (per defecte: 0).', 'contrast: Ajust - 100 a 100 (per defecte: 0).', 'gamma: valor 0. 1 a 3 (per defecte: 1).', 'saturació: Ajust - 100 a 100 (per defecte: 0).', 'to: rotació de color en graus.', 'difuminat: difuminat en píxels.', 'definició: Afila la quantitat 0-100.', 'cartellitza els nivells.', 'llindar: Llindar binari 0- 255.', 'vora: detecció de les vores - apagats, sobel, canny.', 'canvia a 1 per invertir els colors.'],
    },
    {
      heading: 'Paràmetres de la marca d\' aigua',
      paragraphs: ['Afegeix marques d\' aigua per generar codis QR:'],
      bullets: ['wmEn: Arranja a 1 per habilitar l\' aiguamark.', 'wmunit description in lists Classe: tipus de marca d\' aigua - text, imatge, patró.', 'wmText: Text de la marca d\' aigua (URL- codificat).', 'uRL a la imatge de marca d\' aigua.', 'wmPos: Posició - centre, cantonades, vores, darrere, tranquil_ zone.', 'wmOpacity: Opacitat 0-100 (per omissió: 50).', 'wmBlend: Mode de barreja - normal, multipli, pantalla, recobriment.'],
    },
    {
      heading: 'Paràmetres d\' animació',
      paragraphs: ['Per a la sortida GIF animada (require el format=gif):'],
      bullets: ['anim Patró: Patró d\' animació - cap, pols, ona, línia d\' exploració, deriva, color_ cicle.', 'anim Marcs: Nombre de marcs 1- 60 (per omissió: 24).', 'anim Velocitat: retard del marc en mil· lisegons 1010 (per defecte: 100).', 'anim Sembrat: llavor aleatòria per animació.', 'si us plau: l\' animació de forma fàcil - lineal, facilitat_ in, facilitat, facilitat_ in_out, rebot.'],
    },
    {
      heading: 'Paràmetres de sortida',
      paragraphs: ['Opcions del format de sortida:'],
      bullets: ['qualitat: qualitat WebP 0-1 (per omissió: 0. 9).', 'webpQ: WebP qualitat 0-100 (per omissió: 90).', 'gifColors: Mida de la paleta GIF 2- 56 (per omissió: 256).', 'ppp: sortida DPI per PNG (per defecte: 72).', 'metatitle, metauthor, metacopia, meta Camps de metadades PNG.'],
    },
    // Crop Parameters
    {
      heading: 'Paràmetres de cultiu',
      paragraphs: ['Opcions de retall de la imatge de superposició:'],
      bullets: ['cropEn: activa el retall de superposició 0/1 (per defecte: 0).', 'cropX: retalla el centre X com a fracció 0-1 (per defecte: 0,5).', 'cropY: retalla el centre Y com a fracció 0-1 (per defecte: 0,5).', 'cropSize: retalla la mida com a fracció de la imatge 0-1 (per defecte: 1).'],
    },
    // Safety Lock Parameters
    {
      heading: 'Paràmetres de bloqueig de seguretat',
      paragraphs: ['Controleu quins elements QR estan protegits de la modificació de la superposició:'],
      bullets: ['lockF: Patrons de cerca de bloqueig 0/1 (per defecte: 1).', 'lockT: Patrons de temporització de bloqueig 0/1 (per defecte: 1).', 'lockA: patrons d\'alineació de bloqueig 0/1 (per defecte: 1).', 'lockFmt: informació de format de bloqueig 0/1 (per defecte: 1).', 'lockV: Bloqueja la informació de la versió 0/1 (per defecte: 1).', 'safeMode: mode de seguretat: desactivat, equilibrat, estricte (per defecte: desactivat).', 'safeMinPx: Mida mínima del mòdul en píxels (per defecte: 2).', 'safeMinQz: mòduls mínims de zones tranquil·les (per defecte: 4).'],
    },
    // Auto-tuning Parameters
    {
      heading: 'Paràmetres d\'autoajustament',
      paragraphs: ['Configuració d\'optimització automàtica:'],
      bullets: ['autoVer: Tria automàticament la versió QR 0/1 (per defecte: 1).', 'autoEcc: Tria automàticament el nivell ECC 0/1 (per defecte: 0) - només la pista del servidor.', 'autoReduce: [NOMÉS PER A CLIENT] Redueix automàticament la intensitat fins que es pugui escanejar: requereix un bucle de validació d\'escaneig.'],
    },
    // Additional Animation Parameters
    {
      heading: 'Paràmetres d\'animació addicionals',
      paragraphs: ['Controls d\'animació ampliats per a la sortida GIF:'],
      bullets: ['bucle: l\'animació fa bucles contínuament 0/1 (per defecte: 1).', 'rebot: direcció d\'animació de ping-pong 0/1 (per defecte: 0).', 'inversa: reprodueix l\'animació al revés 0/1 (per defecte: 0).', 'colorCycle: activa l\'efecte de cicle de color 0/1 (per defecte: 0).', 'interp: interpolació de fotogrames - none, crossfade, morph (per defecte: none).', 'tempDither: tramado temporal: desactivat, blue_noise, flicker_safe (per defecte: desactivat).', 'startF: fotograma inicial de l\'animació (per defecte: 0).', 'maxF: nombre màxim de fotogrames per renderitzar (per defecte: 0 = automàtic).', 'stepF: interval de pas de fotograma (per defecte: 1).', 'jitter: [NOMÉS PER A CLIENT] Oscil·lació del mòdul en píxels: requereix regeneració de QR per fotograma.'],
    },
    // Dithering Parameters
    {
      heading: 'Paràmetres de tramado',
      paragraphs: ['Controla els algorismes de tramado per al processament de superposició:'],
      bullets: ['ditherKind: algorisme de dither - error_diffusion, ordered_bayer, blue_noise, etc. (per defecte: ordered_bayer).', 'diffusionKernel: Nucli de difusió d\'error - floyd_steinberg, jarvis_judice_ninke, stucki, burkes, sierra, atkinson (per defecte: floyd_steinberg).', 'ditherStrength: intensitat de dither 0-100 (per defecte: 50).', 'serpentina: tramado de serpentina 0/1 (per defecte: 0).', 'matriu: matriu de tramado ordenada: bayer2, bayer4, bayer8 (per defecte: bayer4).', 'bnTile: mida del quadre de soroll blau (per defecte: 64).', 'bnSeed: llavor aleatòria de soroll blau (per defecte: 0).', 'colorDither: tramado de color: cap, per_canal, perceptiu (per defecte: cap).'],
    },
    // Subpixel Parameters
    {
      heading: 'Paràmetres de subpíxels',
      paragraphs: ['Configuració per al mode de combinació de subpíxels:'],
      bullets: ['spGrid: mida de la quadrícula de subpíxels: 2x2, 3x3, 4x4 (per defecte: 3x3).', 'spCenter: Regla central: estricte, centre de mitges tons (per defecte: estricte).', 'spNeutral: hexadecimal de color neutre sense # (per defecte: 808080).', 'spFinder: substitució del cercador - sòlid, estilitzat (per defecte: sòlid).'],
    },
    // Halftone Parameters
    {
      heading: 'Paràmetres de mitges tintes',
      paragraphs: ['Configuració del mode de combinació de mitges tintes:'],
      bullets: ['htCell: mida de cel·la de mitges tons: per_mòdul o quadrícula nxn (per defecte: per_mòdul).', 'htDot: forma de punt - cercle, quadrat, línia (per defecte: cercle).', 'htCurve: corba de brillantor - lineal, corba s, gamma (per defecte: lineal).', 'duo1: hexadecimal de color d\'ombra duoton sense # (per defecte: 000000).', 'duo2: hexadecimal de color de ressaltat biton sense # (per defecte: ffffff).'],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'Paràmetres del mode ECC-Aware',
      paragraphs: ['Distribució intel·ligent de superposició basada en la capacitat de correcció d\'errors:'],
      bullets: ['eccAware: activa el mode d\'ECC-aware 0/1 (per defecte: 0).', 'eccRisk: percentatge del pressupost de risc 0-100 (per defecte: 50).', 'eccMap: mapa de pes - distance_to_finders, block_heatmap, empirical_scan_heatmap (per defecte: distance_to_finders).'],
    },
    // Frame Parameters
    {
      heading: 'Paràmetres del marc',
      paragraphs: ['Configuració del marc decoratiu:'],
      bullets: ['marc: estil de marc: cap, marc_arrodonit, adhesiu, etiqueta (per defecte: cap).', 'frameText: text per mostrar al marc (URL codificat).'],
    },
    // Per-Module Color Parameters
    {
      heading: 'Paràmetres de color per mòdul',
      paragraphs: ['Opcions de coloració de mòduls individuals:'],
      bullets: ['modColor: mode de color: sòlid, per_brillante, per_posició, per_superposició, per_cluster (per defecte: sòlid).', 'cGuard: protecció de contrast 0/1 (per defecte: 0).', 'minContrast: relació de contrast mínima 1-21 (per defecte: 4,5).', 'paleta: colors hexadecimals separats per comes per al mode de paleta.', 'paletteMode: distribució de la paleta: posició, brillantor, diagonal, radial, aleatori, fila, columna (per defecte: posició).'],
    },
    // GIF Overlay Parameters
    {
      heading: 'Paràmetres de superposició GIF',
      paragraphs: ['Configuració per a imatges de superposició GIF animades:'],
      bullets: ['ovType: tipus de superposició: estàtic, gif, apng, webp_anim, vídeo (per defecte: estàtic).', 'ovFramePick: selecció de fotogrames - all, every_n, max_frames, duration_limit (per defecte: tots).', 'gifDelays: utilitza retards de fotogrames GIF originals 0/1 (per defecte: 1).', 'gifDispH: gestió de l\'eliminació de GIF: respectar, simplificar (per defecte: respectar).'],
    },
    // Per-ECC Intensity Limits
    {
      heading: 'Límits d\'intensitat per ECC',
      paragraphs: ['Intensitat màxima de superposició per nivell de correcció d\'errors:'],
      bullets: ['maxIntL: intensitat màxima per a ECC L 0-100 (per defecte: 100).', 'maxIntM: intensitat màxima per a ECC M 0-100 (per defecte: 100).', 'maxIntQ: intensitat màxima per a ECC Q 0-100 (per defecte: 100).', 'maxIntH: intensitat màxima per a ECC H 0-100 (per defecte: 100).'],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'Paràmetres de simulació de control de qualitat (només per al client)',
      paragraphs: ['Aquests paràmetres s\'analitzen per a la compatibilitat d\'URL, però només funcionen al navegador:'],
      bullets: ['qaContrast: activa la comprovació de contrast 0/1: requereix validació interactiva.', 'qaBlur: simula el desenfocament en píxels, només per a proves interactives.', 'qaNoise: simula el nivell de soroll, només per a proves interactives.', 'qaHeatmap: mostra el mapa de calor de llegibilitat 0/1: requereix una interfície d\'usuari de superposició de llenç.'],
    },
    // Client-Only Parameters
    {
      heading: 'Paràmetres només per al client',
      paragraphs: ['La majoria dels paràmetres de l\'API són totalment compatibles amb el servidor. Els paràmetres marcats com [NOMÉS PER A CLIENT] s\'analitzen per a la compatibilitat d\'URL, però requereixen funcions del navegador:'],
      bullets: ['jitter: el jitter del mòdul requereix una regeneració de QR per fotograma amb aleatorietat.', 'autoReduce: la reducció automàtica d\'intensitat requereix proves d\'exploració iteratives.', 'qaContrast, qaBlur, qaNoise, qaHeatmap: la simulació de control de qualitat requereix la validació interactiva del llenç.'],
    },
    // Additional Output Parameters
    {
      heading: 'Paràmetres de sortida addicionals',
      paragraphs: ['Configuració de sortida i exportació ampliada:'],
      bullets: ['fname: nom de fitxer personalitzat per a les baixades (per defecte: anqr-qrcode).', 'inclQz: Inclou la zona tranquil·la a les dimensions de sortida 0/1 (per defecte: 1).', 'bgOver: el color de fons anul·la l\'hexadecimal sense # (substitueix el paràmetre bg).', 'fmtExtra: sortida de format addicional: cap, eps, animated_webp (per defecte: cap). Nota: eps és [PARCIAL].', 'svgPrec: precisió de la forma SVG - píxel, precís (per defecte: píxel). [PARCIAL] Sortida SVG limitada al costat del servidor.', 'svgEmbed: incrusta una superposició de ràster a SVG 0/1 (per defecte: 1). [PARCIAL] Sortida SVG limitada al costat del servidor.', 'modulePx: mida del píxel del mòdul (per defecte: es calcula automàticament a partir de la mida).', 'border: mòduls de vora addicionals més enllà de la zona tranquil·la (per defecte: 0).', 'nítid: activa la representació d\'imatges nítides/pixelades 0/1 (per defecte: 1).', 'snap: mode d\'ajust de píxels: pis, rodó, sostre (per defecte: pis).'],
    },
    // Pattern Preservation Parameters
    {
      heading: 'Paràmetres de preservació del patró',
      paragraphs: ['Controleu quins elements estructurals estan protegits de la superposició:'],
      bullets: ['keepFinders: conserva els patrons del cercador 0/1 (per defecte: 1).', 'keepTiming: conserva els patrons de temporització 0/1 (per defecte: 0).', 'keepAlign: conserva els patrons d\'alineació 0/1 (per defecte: 0).', 'protectFmt: Protegeix els mòduls d\'informació de format 0/1 (per defecte: 0).', 'protectVer: Protegeix els mòduls d\'informació de versió 0/1 (per defecte: 0).'],
    },
    {
      heading: 'Ús d\' exemple',
      paragraphs: ['Codi QR bàsic:', 'https://anqr. link/api/qr?data=https://exemple.com', 'Codi Styled QR amb colors personalitzats:', 'https://anqr. link/api/qr? data=Hola i mida=300+fg=1e40af& bg=ffffstyle i=gradei=30', 'Codi QR amb imatge de recobriment:', 'https://anqr. link/api/qr? data=https://exemple.com andec=H+img=https://exemple.com/logo.png i mode=thoney=70', 'GIF animat:', 'https://anqr. link/api/qr? data=Hola iformat=gif& iniPattern=pulse iniFrames=24 iflafe=in_out'],
      links: [{ href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' }],
    },
    {
      heading: 'Codis QR encastats',
      paragraphs: ['En mode professional, la característica de compartició genera HTML i URL encastats. Així és com funciona l\' encastat:'],
      bullets: ['Comparteix l\' enllaç: Crea un URL a l\' aplicació ANQR amb tots els paràmetres codificats com a paràmetres URL. Els destinataris poden veure i modificar el codi QR.', 'Imatge Embada: Genera una etiqueta <img> apuntant a l\' API del servidor. El codi QR és renderitzat al servidor i es serveix com una imatge.', 'Embed Markdown: Crea sintaxi de la imatge de marca per a la documentació i fitxers README.', 'URL de l\' API directa: L\' URL de l\' API cru per usar- lo en aplicacions, scripts, o d\' altres integració.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
    {
      heading: 'Exemple HTML',
      paragraphs: ['Per encastar un codi QR al vostre lloc web:', '<img src="https://anqr. link/api/qr?data=https://teuteit.com i size=200" at="QR Code" />', 'Per a la mida receptiva:', '<img src="https://anqr. link/api/qr?data=https://teuteit.com i size=400" atlt="QR Code" style=" max- width: 100%: alçada auto; ">', 'El servidor cau respostes amb capçaleres de la memòria cau llarga, així que repetides peticions per al mateix URL són ràpids.'],
    },
    {
      heading: 'Format d\' URL de compartició',
      paragraphs: ['Quan cliqueu Compartit en mode professional, AAQR codificarà l\' arranjament actual en els paràmetres URL. El format és:', 'https://anqr.link /?data=... andec=H+style=alging&...', 'Aquests paràmetres reflecteixen els paràmetres de l\' API, de manera que podeu convertir un URL de compartició a un URL API canviant la ruta base des de / a / a / api/ qr i ajustant paràmetres w/ h com sigui necessari.', 'Nota: no es poden compartir imatges de fitxers locals mitjançant URL - només recobriments basats en URL (img paràmetre) en enllaços compartits i crides API.'],
    },
    {
      heading: 'Valora límits i ús',
      paragraphs: ['L\' API és lliure d\' usar per als volums raonables. Per a ús de gran volum o aplicacions comercials que requereixen temps garantits, si us plau contacteu amb nosaltres.', 'Les respostes API inclouen capçaleres de cau agressiva. Per a millor rendiment, la memòria cau respon al vostre final o useu la mateixa URL consistent per als codis QR idèntics.'],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: 'Millors exercicis',
      paragraphs: ['Segueix aquestes directrius per als codis de QR fiables:'],
      bullets: ['Prova sempre els codis QR amb múltiples aplicacions d\'escàner abans d\' imprimir.', 'Usa la correcció d\' errors H (Ressalta) en afegir recobriment.', 'Mantén com a mínim 4 mòduls de zona silenciosa (margin).', 'Assegureu- vos d\' alt contrast entre primer pla i fons.', 'Per a imprimir, useu almenys 300 PPP i proveu a la mida actual de la impressió.', 'Habilita els patrons de cerca quan s\' usen recobriment.', 'Comença amb intensitat menor i augment gradual.', 'Per a l\' ús de la porta, considereu la mida més gran del mòdul i la correcció d\' errors més alta.'],
      links: [
        { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
        { href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' },
      ],
    },
    {
      heading: 'Solució de problemes',
      paragraphs: ['Problemes i solucions comuns:'],
      bullets: ['QR no explorarà: Redueix la intensitat del recobriment, incrementa la correcció d\' errors, comprova el contrast.', 'Codi massa gran: Redueix la longitud del contingut, usa l\' URL curtener, la versió inferior.', 'Sortida de desenfocament: Augmenta la mida del mòdul, usa PNG enlloc de formats comprimits.', 'Els colors semblen malament: Comprova el contrast del color, prova el mode de recobriment de grisos.', 'GIF no animada: Assegureu- vos d\' usar la sortida de format GIF, el recompte de marcs.', 'El recobriment d\' imatge no s\' està carregant: Comproveu els permisos CORS en imatges remotes.'],
      links: [{ href: '/learn?lang=${lang}#section-5', label: 'Mireu guies i exemples relacionats', type: 'learn' }],
    },
    {
      heading: 'Dreceres de teclat',
      paragraphs: ['ANQR suporta les dreceres de teclat estàndard. Useu Ctrl/ Cmd+S per activar l\' exportació (quan es focus en la vista prèvia).'],
    },
    {
      heading: 'Compartir & encastat',
      paragraphs: ['En mode professional, feu clic sobre el botó Comparteix per copiar un URL amb l\' arranjament actual. Els destinataris poden obrir aquest URL per a veure la vostra configuració exacta. Nota: no es poden compartir imatges d\' un fitxer local via URL.'],
      links: [{ href: '/?lang=${lang}&tab=professional#share', label: 'Proveu directament aquesta configuració en el generador ANQR.', type: 'generator' }],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: 'Explora els articles', type: 'learn' },
    { href: '/examples?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'example' },
    { href: '/gallery?lang=${lang}', label: 'Visualitzeu exemples QR', type: 'gallery' },
    { href: '/?lang=${lang}', label: 'Obre el generador', type: 'generator' },
  ],
};

export default guide;
