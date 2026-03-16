import type { PageDefinition } from "../types";

export const guide: PageDefinition = {
  title: "Guida utente ANQR",
  description: "Guida completa per l'utilizzo di ANQR per la creazione di codici QR.",
  lastUpdated: "1 febbraio 2026",
  breadcrumb: ["Guida"],
  primaryLinks: [
    { href: "/?lang=${lang}", label: "Aprire il generatore", type: "generator" },
    { href: "/learn?lang=${lang}", label: "Sfoglia gli articoli", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Visualizza esempi di QR", type: "example" },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: "Iniziare",
      paragraphs: [
        "ANQR è un generatore di codice QR con un approccio client-first. Per impostazione predefinita, i codici QR vengono generati localmente nel tuo browser - nessun account richiesto e i tuoi dati rimangono privati. Per l'integrazione professionale, è anche possibile utilizzare l'API lato server.",
        "L'interfaccia ha tre livelli di interfaccia: Basic, Advanced e Professional. Selezionare il livello utilizzando le schede nell'intestazione. Ogni livello sblocca funzionalità aggiuntive mantenendo l'interfaccia focalizzata su ciò di cui hai bisogno.",
      ],
      bullets: [
        "Fondamentale: Creazione di codice QR semplice con contenuto testo/URL e sovrapposizione immagine.",
        "Avanzate: opzioni di codifica QR, stili di rendering, animazione, formati di output, tipi di contenuti estesi e personalizzazione overlay.",
        "Professionista: filigrane, metadati, condivisione, analisi di sicurezza, codici QR di pagamento e funzioni aziendali.",
      ],
      links: [{ href: "/?lang=${lang}", label: "Aprire il generatore", type: "generator" }],
    },
    {
      heading: "Avvio rapido",
      paragraphs: ["Per creare il tuo primo codice QR:"],
      bullets: [
        "1. Seleziona un tipo di contenuto (URL, testo, WiFi, ecc.) dal menu a tendina del tipo di contenuto.",
        "2. Inserisci i tuoi dati nei campi forniti.",
        "3. Opzionalmente personalizzare colori, stili e aggiungere un'immagine sovrapposizione.",
        "4. Fare clic su Esporta per scaricare il tuo codice QR come PNG, GIF, WebP o SVG.",
      ],
      links: [
        {
          href: "/?lang=${lang}",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: "Caratteristiche di base",
      paragraphs: [
        "Il livello di base fornisce un'interfaccia semplificata per la creazione di codici QR con contenuto di payload e sovrapposizioni di immagine. Questo è il modo più semplice per iniziare.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Tipi di contenuto (Basic)",
      paragraphs: [
        "Testo normale: codifica qualsiasi testo fino al limite di capacità del codice QR. Ideale per brevi messaggi, codici o identificatori.",
        "URL: codifica gli indirizzi web. Il codice QR aprirà l'URL quando viene scansionato. Supporta i protocolli http:// e https://.",
      ],
    },
    {
      heading: "Sovrapposizione immagine (Basic)",
      paragraphs: [
        "Caricare un'immagine (JPG, PNG, GIF, WebP) per fondersi con il codice QR. Le caratteristiche di sovrapposizione di base includono:",
      ],
      bullets: [
        "Carica da file: Seleziona un'immagine dal tuo dispositivo.",
        "Carica dall'URL: Inserisci un URL di immagine (deve consentire CORS).",
        "Logo centrale: Imposta l'immagine nel centro, basandosi sulla correzione di errore.",
        "Miscela: Semplice miscelazione alfa di immagine con disegno QR.",
        "Intensità: controlla quanto fortemente l'overlay influisce sul codice QR (0-100%).",
        "Modalità colore: colore pieno, scala di grigi, o nero & bianco.",
        "Conservare i modelli di ricerca: Mantiene i modelli di angolo non modificati per la scansione affidabile.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=basic#overlay",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: "Caratteristiche avanzate",
      paragraphs: [
        "Il livello avanzato sblocca le opzioni di codifica QR, rendering stili, animazione, formati di output, tipi di contenuti estesi e personalizzazione overlay avanzata.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Impostazioni di codifica QR",
      paragraphs: [
        "Versione: i codici QR sono disponibili nelle versioni 1-40, con versioni più elevate che contengono più dati ma sono più grandi. Impostare a 0 (Auto) per consentire a ANQR di scegliere la versione più piccola che si adatta al contenuto.",
        "Correzione degli errori: Determina la quantità di danno che un codice QR può sostenere rimanendo scansionabile.",
      ],
      bullets: [
        "L (Low): correzione di errore del 7% - dimensione più piccola, meno ridondanza.",
        "M (Medium): 15% correzione di errore - opzione bilanciata.",
        "Q (Quartile): correzione di errore del 25% - buono per i codici stampati.",
        "H (High): correzione di errore del 30% - migliore per i codici con sovrapposizioni o in condizioni difficili.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#qr-encoding",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Zona tranquilla (Margin)",
      paragraphs: [
        "La zona tranquilla è lo spazio bianco intorno al codice QR. Gli scanner hanno bisogno di questo margine per rilevare l'avvio del codice. Lo standard consiglia almeno 4 moduli. Ridurre sotto 4 può causare problemi di scansione.",
      ],
    },
    {
      heading: "Stile del modulo",
      paragraphs: [
        "I moduli sono le singole piazze che compongono un codice QR. ANQR offre cinque stili:",
      ],
      bullets: [
        "Piazza: Classico aspetto QR con angoli affilati.",
        "Arrotondato: Angoli morbidi per un look più amichevole.",
        "Punti: Moduli circolari per un'estetica moderna.",
        "Diamante: 45° quadrati ruotati per un motivo distintivo.",
        "Collegato: I moduli si fondono quando adiacenti, creando forme organiche.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Stile di ricerca",
      paragraphs: [
        "I modelli di Finder sono i tre grandi quadrati in angoli QR che aiutano gli scanner a orientare il codice. Stile disponibili:",
      ],
      bullets: [
        "Piazza: angoli quadrati standard.",
        "Arrotondato: Angoli ammortizzati in stile modulo arrotondato.",
        "Cerchio: Modelli di ricerca circolare per codici di stile puntino.",
      ],
    },
    {
      heading: "Allineamento & Timing Patterns",
      paragraphs: [
        "I modelli di allineamento appaiono in codici QR più grandi (versione 2+) per aiutare a correggere la distorsione. I modelli di temporizzazione sono le linee alternanti che collegano i modelli di ricercatore.",
      ],
      bullets: [
        "Stile di allineamento: Match Finder, Square, Rounded, o Circle.",
        "Stile di tempo: Modulo di corrispondenza, Solido, o Dashed.",
      ],
    },
    {
      heading: "Colori",
      paragraphs: [
        "Il primo piano: Il colore dei moduli QR. Nero (#000000) è standard ma qualsiasi colore scuro funziona.",
        "Sfondo: Il colore di sfondo. White (#ffffffff) è standard. Assicurare un contrasto sufficiente con il primo piano.",
        "Sfondo trasparente: Rimuovere lo sfondo interamente per l'uso su superfici colorate. Assicurare la superficie fornisce un contrasto adeguato.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Dimensione del modulo & Gap",
      paragraphs: [
        "Dimensione del modulo: controlla quanto grande ogni modulo è reso in pixel. I valori più grandi creano codici più grandi e più facili da usare.",
        "Modulo Gap: Aggiunge spazio tra i moduli in percentuale. Le piccole lacune (5-15%) possono migliorare la scansione in alcune condizioni, ma le lacune eccessive riducono l'affidabilità.",
      ],
    },
    {
      heading: "Impostazioni di uscita",
      paragraphs: ["Formato: Scegli il formato di esportazione in base al caso di utilizzo."],
      bullets: [
        "PNG: formato raster senza perdita, ideale per la maggior parte degli usi. Meglio per stampa e digitale.",
        "WebP: Formato moderno con dimensioni di file più piccole. Buono per uso web.",
        "GIF: richiesto per codici QR animati. Supporta la trasparenza.",
        "SVG: Formato vettoriale che scala infinitamente. Meglio per stampa di grandi dimensioni o quando è necessario modificare il codice.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-3",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Dimensioni di uscita",
      paragraphs: [
        "Larghezza/altezza: Impostare la dimensione di uscita in pixel. Per la stampa, calcolare in base al DPI (ad esempio, 300 DPI a 1 pollice = 300px). Le dimensioni più grandi eseguono una scansione più affidabile a distanza.",
      ],
    },
    {
      heading: "Impostazioni di animazione (avanzata)",
      paragraphs: ["Controllare il comportamento del codice QR animato:"],
      bullets: [
        "Velocità: tasso di frame di animazione in millisecondi.",
        "Loop: animazione continua o single-play.",
        "Bounce: direzione di animazione Ping-pong.",
        "Start Frame: Inizia l'animazione da cornice specifica.",
        "Max Frames: Limita le cornici totali in animazione.",
        "Passo telaio: Salta cornici per l'animazione più veloce.",
        "Interpolazione: Nessuno, Crossfade, o Morph tra cornici.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#animation",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Tipi di contenuto (avanzati)",
      paragraphs: ["Il livello avanzato sblocca ulteriori formati di payload:"],
      bullets: [
        "Numero di telefono (tel:): crea un collegamento telefonico chiamabile.",
        "Email (mailto:): Si apre client di posta elettronica con soggetto e corpo facoltativo.",
        "SMS: messaggio di testo pre-riempito a un numero di telefono.",
        "vCard: Carta di contatto completa con nome, organizzazione, telefono, e-mail, indirizzo.",
        "MeCard: Formato di contatto compatto popolare in Giappone.",
        "BizCard: Legacy formato carta di affari.",
        "Geo Location: coordinate GPS che si aprono nelle mappe.",
        "WiFi: Credenziali di rete per la connessione automatica (SSID, password, tipo di sicurezza).",
        "Calendario Evento: formato iCalendar con titolo, posizione, data/ora.",
        "Evento RSVP: Link alla pagina di registrazione eventi.",
        "Iscriviti al calendario: Iscriviti a un feed ICS/WebCal.",
        "URL del file/documento: link diretto ai file scaricabili.",
        "Cloud Storage Link: Link a Google Drive, Dropbox, OneDrive, ecc.",
        "Profilo sociale: Link a LinkedIn, Twitter, Instagram, ecc.",
        "Link di messaggistica: WhatsApp, Telegramma, Segnale link profondi.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Caratteristiche avanzate dell'overlay",
      paragraphs: ["Ulteriori capacità di sovrapposizione:"],
      bullets: [
        "Crop: Abilita il ritaglio per selezionare una regione quadrata della tua immagine.",
        "Mezzo tono: Classico modello di punto stampa basato sulla luminosità dell'immagine.",
        "Dithered: Dithering per la riproduzione dettagliata.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#overlay",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Modalità di miscela sovrapposizione (avanzata)",
      paragraphs: ["Modalità di miscelazione aggiuntive a livello avanzato:"],
      bullets: [
        "Subpixel: Divide ogni modulo in subpixel per maggiori dettagli.",
        "Blue Noise: Utilizza il dithering del rumore blu per motivi senza artefatti.",
        "Mosaico: effetto a base di piastrelle preservare la struttura dell'immagine.",
        "Riempimento di Gap: Immagine dei luoghi in spazi vuoti tra i moduli.",
        "Luminosità: dimensione del modulo Varies in base alla luminosità dell'immagine.",
        "Duotone: Mappe immagine a due colori per contrasto impressionante.",
      ],
    },
    {
      heading: "Intensità di sovrapposizione",
      paragraphs: [
        "Controlla quanto fortemente la sovrapposizione influisce sul codice QR (0-100%). I valori più elevati mostrano più dettagli dell'immagine, ma possono ridurre la scansione. Iniziare intorno al 70% e regolare in base ai test.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Modalità colore",
      paragraphs: ["Come viene elaborata l'immagine sovrapposizione:"],
      bullets: [
        "Colore completo: Conserva colori originali dell'immagine.",
        "Scala di grigi: Converte in toni bianchi e neri.",
        "Bianco e nero: Conversione binaria ad alto contrasto.",
      ],
    },
    {
      heading: "Conservare i modelli di ricerca",
      paragraphs: [
        "Quando abilitato, mantiene i tre modelli di ricerca angolare non modificati dall'overlay. Fortemente consigliato per una scansione affidabile.",
      ],
    },
    {
      heading: "Preelaborazione dell'immagine",
      paragraphs: [
        "Applicare i filtri all'immagine di sovrapposizione prima della miscelazione. Queste regolazioni possono migliorare come l'immagine appare nel codice QR finale.",
      ],
      bullets: [
        "Luminosità (-100 a +100): illuminare o oscurare l'immagine.",
        "Contrasto (-100 a +100): Aumentare o diminuire la gamma tonale.",
        "Gamma (0.2 a 3.0): regolazione della luminosità non lineare. Valori inferiori a 1 fulmini midtones, sopra 1 scurirli.",
        "Saturazione (-100 a +100): intensità colore. -100 è scala di grigi, +100 è sovrasaturato.",
        "Hue Rotate (0-360°): Spostare tutti i colori intorno alla ruota di colore.",
        "Blur (0-20px): Ammorbidire i dettagli dell'immagine.",
        "Sharpen (0-100%): Migliorare i bordi e i dettagli.",
        "Posterize (0-16 livelli): Ridurre i livelli di colore per un effetto poster.",
        "Threshold (0-255): Converti in binario nero/bianco al punto di cutoff.",
        "Rilevamento bordi: algoritmi Sobel o Canny per mostrare solo bordi.",
        "Invertire: Invertire tutti i colori.",
      ],
    },
    {
      heading: "Modalità di montaggio",
      paragraphs: ["Come l'immagine sovrapposizione si adatta all'area QR code:"],
      bullets: [
        "Copertura: L'immagine riempie l'intera area, ritagliando se necessario.",
        "Contiene: immagine intera visibile, può avere margini.",
        "Stretch: L'immagine distorce per riempire esattamente.",
      ],
    },
    {
      heading: "Opzioni di trasformazione",
      paragraphs: [
        "Rotazione: Ruotare sovrapposizione in incrementi di 90°.",
        "Flip X/Y: Specchio l'immagine in orizzontale o verticale.",
      ],
    },
    {
      heading: "Dithering Algoritmi",
      paragraphs: [
        "Dithering converte immagini in tono continuo a modelli che i codici QR possono rappresentare. Disponibile quando si utilizza Dithered, Blue Noise, o True Dither blend modes.",
      ],
      bullets: [
        "Diffusione di errore: stile classico Floyd-Steinberg. Spreads errore di quantizzazione ai pixel vicini.",
        "Ordinato (Bayer): Utilizza una matrice di soglia per modelli regolari.",
        "Clustered Dot: Simula la stampa a metà tono.",
        "Void & Cluster: Dithering ordinato ottimizzato.",
        "Blu rumore: visivamente piacevole casuale-looking modello.",
        "Il rumore blu Soglia: Dithering di soglia con texture di rumore blu.",
        "White Noise: Dithering di soglia casuale.",
        "Gaussian/Triangolare Rumore: Rumore con diverse distribuzioni.",
        "Blu rumore + errore Diffusione: ibrido combinando entrambe le tecniche.",
        "Rumore blu proiettato: schema di rumore blu simile a schermo.",
        "Percettivo: Luminance-peso per migliori risultati visivi.",
        "Edge-Aware: Conserva i bordi dell'immagine durante la dithering.",
        "Soglia adattiva: Sogliamento localmente adattativo.",
        "Temporal Blue Noise: Per GIF animati, varia modello per frame.",
      ],
    },
    {
      heading: "Kernel diffusione",
      paragraphs: [
        "Quando si utilizza Diffusion Dithering di errore, scegliere come si distribuisce l'errore:",
      ],
      bullets: [
        "Floyd-Steinberg: diffusione classica di 4 vicini. Buona scelta generale.",
        "Jarvis-Judice-Ninke: 12-ighbor, più liscia ma più lenta.",
        "Stucki: Simile a JJN con pesi diversi.",
        "Burkes: semplificato JJN, più veloce.",
        "Sierra: Famiglia di kernel bilanciando qualità e velocità.",
        "Atkinson: diffusione della luce, conserva dettagli ma può essere granuloso.",
      ],
    },
    {
      heading: "Dither Strength",
      paragraphs: [
        "Controlla quanto viene applicato il dithering (0-100%). Valori inferiori conservano più del modello originale, valori più alti mostrano più dettagli immagine.",
      ],
    },
    {
      heading: "Impostazioni subpixel",
      paragraphs: ["Quando si utilizza la modalità di miscela Subpixel:"],
      bullets: [
        "Dimensioni griglia: 2×2, 3×3, o 4×4 subpixel per modulo. Più alto = più dettaglio.",
        "Regola centrale: Strict richiede subpixel centrale per il modulo di corrispondenza. Halftone Center permette variazioni.",
        "Colore neutro: colore usato per subpixel non definiti.",
        "Cercatore Override: Come vengono resi i modelli di ricerca (Solid o Stylized).",
      ],
    },
    {
      heading: "Impostazioni di mezzatone",
      paragraphs: ["Quando si utilizza la modalità miscela di mezzatone:"],
      bullets: [
        "Dimensioni della cella: Per Modulo o griglia N×N.",
        "Forma del punto: cerchio, quadrato, o linea.",
        "Curva di luminosità: lineare, S-Curve, o Gamma.",
      ],
    },
    {
      heading: "Colori di Duotone",
      paragraphs: [
        "Quando si utilizza la modalità miscela Duotone, impostare il colore Ombra (aree scure) e il colore Highlight (aree luminose).",
      ],
    },
    {
      heading: "Impostazioni di animazione GIF",
      paragraphs: ["Quando si utilizzano sovrapposizioni GIF animate:"],
      bullets: [
        "Utilizzare Frame Delays: Rispettare tempistiche GIF originali.",
        "FPS massimo: limite frame rate (1-60 fps).",
        "Smaltimento: Rispetto o semplificare i metodi di smaltimento dei frame.",
      ],
    },
    {
      heading: "Opzioni di rendering avanzate",
      paragraphs: ["Ulteriori controlli di rendering:"],
      bullets: [
        "Modalità Gap: Nessuno, Inset, Stroke, o Negative Space gap styling.",
        "Radius angolo: Percentuale di angoli arrotondati per moduli.",
        "Gradiente: Nessuna, lineare, radiale o gradiente conico sui moduli.",
        "Eye Outer/Inner Style: styling indipendente per gli anelli del modello del ricercatore.",
        "Dot Rotation: Ruotare i moduli diamante/dot.",
        "Scala degli occhi: regolazione della dimensione per i modelli di ricerca.",
        "Stile telaio: Aggiungi cornici decorative (Rounded Frame, Sticker, Tag).",
        'Testo della struttura: Aggiungi testo come \\"Scan Me!\\" alle cornici.',
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#render",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Codifica avanzata del QR",
      paragraphs: ["Codifica QR:"],
      bullets: [
        "Modalità di codifica: Auto, Numerico, Alfanumerico, Byte/UTF-8, o Kanji.",
        "Enforce Min Quiet Zone: Assicurare almeno 4 margini di modulo.",
        "Modello di maschera: Auto (ottimo), o selezionare manualmente i modelli 0-7 per controllare la distribuzione del modulo. Diversi modelli creano diverse apparizioni visive mentre codifica gli stessi dati.",
        "Codifica del carattere: ISO-8859-1 (predefinito latino-1), UTF-8 (compreso Unicode incluso emoji), o Shift-JIS (giapponese). Scegli in base ai requisiti di carattere del tuo contenuto.",
      ],
    },
    {
      heading: "Opzioni di uscita avanzate",
      paragraphs: ["Impostazioni di esportazione aggiuntive:"],
      bullets: [
        "Nome file: Nome file personalizzato per i download.",
        "GIF Palette Dimensioni: 2-256 colori in uscita GIF.",
        "GIF Quantizer: Median Cut, NeuQuant, o Octree riduzione del colore.",
        "Dithering GIF: disattivato, Floyd-Steinberg o ordinato.",
        "GIF Colore trasparente: Impostare un colore per essere trasparente.",
        "SVG Vero vettore: Utilizzare percorsi invece di raster incorporato.",
        "SVG Precisione della forma: rendering del percorso Pixel o Precise.",
        "SVG Incorpora Raster Overlay: Includere overlay come immagine incorporata.",
        "Contesto Override: forzare un colore di sfondo specifico in uscita.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#output",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Opzioni di convalida",
      paragraphs: ["Impostazioni di elaborazione dell'ingresso:"],
      bullets: [
        "Valida l'Input: Controlla il formato del contenuto prima della codifica.",
        "Trim Whitespace: Rimuovere gli spazi iniziali/trailing.",
        "Normalizzare le novità: Convertire tutte le terminazioni di linea in LF.",
        "Guardia di lunghezza massima: Warn se il contenuto supera la capacità QR.",
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: "Caratteristiche professionali",
      paragraphs: [
        "Il livello Professional aggiunge filigrane, metadati, opzioni di condivisione, analisi di sicurezza, codici QR di pagamento e funzioni aziendali.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Osservazione",
      paragraphs: ["Aggiungi filigrane ai tuoi codici QR:"],
      bullets: [
        "Tipo: Testo, immagine, o filigrana modello.",
        "Posizione: Centro, angoli, bordi, dietro o zona tranquilla.",
        "Opacità: trasparenza dei fili (0-100%).",
        "Modalità di miscela: miscelazione normale, multiply, schermo o sovrapposizione.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#watermark",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Metadati",
      paragraphs: ["Metodati incorporati nei file esportati:"],
      bullets: [
        "Titolo, Autore, Copyright, Licenza, campi di descrizione.",
        "Tempo di creazione: Embed timestamp di generazione.",
        "Valore chiave personalizzato: Aggiungere coppie di metadati arbitrari.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#metadata",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Condividere",
      paragraphs: ["Condividi le configurazioni del tuo codice QR:"],
      bullets: [
        "Link diretto: generare un URL condivisibile con le impostazioni attuali.",
        "Embed HTML: Ottieni il codice incorporato per i siti web.",
        "Parametri Encode: Includere tutte le impostazioni nell'URL di condivisione.",
        "Nota: Le immagini overlay dai file locali non possono essere condivise tramite URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-7",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Analisi della sicurezza",
      paragraphs: ["Assicurare che i codici QR rimangano scansionabili:"],
      bullets: [
        "Modalità di sicurezza: requisiti di scansione off, Balanced o Strict.",
        "Modulo minimo Dimensioni: dimensione minima del pixel per modulo.",
        "Il mio silenzio Zona: Moduli di margine minimi.",
        "Cercatori/Timing/Align/Format/Versione: Proteggi elementi specifici.",
        "Max Overlay Intensity by ECC: Limiti di intensità automatica basati sul livello di correzione degli errori.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#safety",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Tipi di contenuto (Professional)",
      paragraphs: ["Livello professionale aggiunge tipi di pagamento e contenuti aziendali:"],
      bullets: [
        "EPC/SEPA (UE): Codici QR di bonifico bancario europeo con IBAN, BIC, importo, riferimento.",
        "UPI (India): interfaccia pagamenti unificati con VPA, nome del beneficiario, importo.",
        "PayNow (Singapore): Pagamento veloce Singapore con UEN o numero di cellulare.",
        "PromptPay (Thailandia): Sistema di pagamento nazionale tailandese.",
        "PIX (Brasile): pagamento immediato brasiliano con chiave PIX.",
        "Crypto: Bitcoin, Ethereum, indirizzi di pagamento Litecoin con importo opzionale.",
        "Marketing Campaign Link: URL con il monitoraggio completo del parametro UTM (Marketing Tags).",
        "Short Link: Per l'uso con abbreviatori URL per codici QR dinamici/trackable.",
        "GS1 Digital Link: Identificazione prodotto con GTIN, seriale, batch, scadenza.",
        "App Deep Link: iOS/Android app deep link con schemi personalizzati.",
        "Formato personalizzato: dati grezzi senza formattazione o validazione.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-2",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: "Pagamenti rilevanti per la lingua in modalità avanzata",
      paragraphs: [
        "Quando si utilizza la modalità avanzata, ANQR mostra automaticamente i metodi di pagamento relativi alla lingua selezionata. Ad esempio, gli utenti vietnamiti vedono VietQR, gli utenti thailandesi vedono PromptPay e gli utenti di lingua indiana vedono UPI e BharatQR. I metodi di pagamento globali (cryptocurrency, PayPal, Cash App) sono disponibili in tutte le lingue. Modalità professionale sblocca tutti gli standard di pagamento indipendentemente dalla lingua.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=advanced#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Standard di pagamento europei",
      bullets: [
        "EPC/SEPA (EU): Codici QR per il trasferimento bancario europeo seguendo lo standard del Codice QR EPC. Supporta IBAN, BIC (facoltativo per domestico), importo in EUR, e riferimenti di pagamento strutturati o non strutturati. Usato in tutta la zona SEPA, compresi i paesi UE più Svizzera, Norvegia, Islanda, Liechtenstein, Monaco e San Marino.",
        "Swiss QR-bill: standard di pagamento svizzero seguendo le linee guida SIX. Supporta CHF e EUR, QR-Reference (QRR), Creditor Reference (ISO 11649), indirizzi creditori strutturati e informazioni sulla fattura. Richiesto per fatture svizzere dal 2022.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Standard di pagamento indiani",
      bullets: [
        "UPI (India): Unified Payments Interface a seguito di NPCI Deep Linking Specification. Supporta VPA (Virtual Payment Address), nome payee, importo in INR, nota di transazione, ID di riferimento, codice categoria mercantile e modalità di transazione.",
        "BharatQR (India): standard QR unificato che supporta sia i pagamenti UPI che quelli basati sulla carta. Combina UPI VPA con scheda PAN per la massima compatibilità. Include nome commerciale, città, MCC, dettagli GST, e numeri di fattura / riferimento.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Sud-est asiatico standard di pagamento",
      bullets: [
        "PayNow (Singapore): Sistema di pagamento rapido a Singapore con specifiche QR EMVCo con profilo SGQR. Supporta UEN (registrazione aziendale), numero mobile o NRIC come identificatori proxy. Include la bandiera di modifica dell'importo e la data di scadenza.",
        "PromptPay (Thailandia): sistema di pagamento nazionale tailandese secondo il profilo EMV della Banca di Thailandia. Supporta numero di cellulare, ID nazionale, ID fiscale, ID portafoglio elettronico e pagamento di fatture con più campi di riferimento.",
        "QRIS (Indonesia): Quick Response Code Indonesian Standard. Standard di pagamento nazionale basato su EMV che supporta l'ID commerciante, NMID (National Merchant ID), la classificazione dei criteri mercantili e le spese di convenienza (fisso o percentuale).",
        "DuitNow (Malaysia): sistema di pagamento immediato malese. Supporta più tipi di proxy tra cui NRIC, mobile, passaporto, ID dell'esercito e numeri di registrazione di affari.",
        "VietQR (Vietnam): standard di trasferimento interbanca vietnamita. Richiede BIN banca (identificazione NAPAS) e numero di conto. Supporta più codici di servizio per diversi tipi di trasferimento (QRPUSH, QRIBFTTA, QRIBFTTC).",
        "QR Ph (Filippine): standard di pagamento QR filippino per InstaPay e PESONet. Utilizza i numeri di conto con l'identificazione del commerciante per le transazioni P2M (da persona a commerciante).",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Standard di pagamento dell'Asia orientale",
      bullets: [
        "TWQR (Taiwan): standard di pagamento QR Taiwanese. Supporta l'ID commerciante, l'ID fiscale e gli importi TWD.",
        "HKQR/FPS (Hong Kong): codici QR del sistema di pagamento più veloce di Hong Kong. Supporta FPS ID, numero mobile o e-mail come identificatori di pagamento. Importi in HKD.",
        "JPQR (Giappone): standard di pagamento del codice QR unificato giapponese. Utilizza ID negozio per identificazione commerciante con importi JPY.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Altri standard di pagamento regionali",
      bullets: [
        "PIX (Brasile): Sistema di pagamento immediato della Banca centrale brasiliana secondo le specifiche BR Code. Supporta le chiavi PIX (CPF, CNPJ, e-mail, telefono o chiave casuale), nome/città del commerciante, ID transazioni e importi BRL.",
        "AusPayNet/NPP Pagamenti (Australia): australiano nuovo pagamento piattaforma PayID sistema. Supporti Pay tipi di ID (email, mobile, ABN, ID organizzazione) o tradizionale BSB + numero di account. Il nome Merchant è facoltativo in quanto i pagatori vedono il nome registrato dalla ricerca NPP.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Pagamenti di criptovaluta",
      bullets: [
        "Bitcoin/Litecoin (BIP-21): URI di pagamento criptovaluta standard con indirizzo del portafoglio, importo facoltativo e etichetta. Compatibile con tutti i principali portafogli Bitcoin e Litecoin.",
        "Rete di illuminazione (BOLT11): Fatture di pagamento Lightning Network. Incolla una stringa di fattura codificata BOLT11 per pagamenti Bitcoin istantanei con costi minimi.",
        "Ethereum (EIP-681): Ethereum richiesta URI che supporta trasferimenti nativi ETH e trasferimenti ERC-20 token. Include l'ID della catena per il supporto multi-network (Mainnet, Polygon, BSC, Arbitrum, Optimism, Avalanche), i parametri del gas e le chiamate della funzione di contratto.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Servizi di pagamento",
      bullets: [
        "PayPal.Me: link di pagamento PayPal con nome utente e importo pre-riempito opzionale. I destinatari possono pagare tramite saldo PayPal, carte o conti bancari.",
        "App Cash: collegamenti di pagamento dell'app Cash utilizzando $cashtag con importo opzionale. Popolare negli Stati Uniti per i pagamenti peer-to-peer.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Generico EMV QR",
      bullets: [
        "EMV Generico: Crea modalità EMV Merchant-Presented Codici QR per schemi di pagamento non specificatamente elencati. Configurare il nome del commerciante, la città, il codice di paese (ISO 3166-1), il codice valuta (ISO 4217 numerico), MCC, opzioni di punta/convenienza e ulteriori campi di dati. Utile per testare o integrazioni personalizzate.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#payload",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: "Modalità di miscela overlay (professional)",
      paragraphs: ["Modalità di miscelazione aggiuntive a livello professionale:"],
      bullets: [
        "Pixelate: effetto overlay pixelato.",
        "Outline: overlay di rilevamento bordo che mostra solo contorni.",
        "Onda: effetto distorsione ondulata.",
        "Dimensione subpixel: dimensionamento subpixel variabile basato sull'immagine.",
        "True Dither: Dithering avanzato con selezione matrice ordinata.",
        "Estrema: massima visibilità dell'immagine, può influenzare la scansione.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Impostazioni di protezione",
      paragraphs: [
        "Controllo a grana fine su cui gli elementi QR sono protetti da modifiche overlay:",
      ],
      bullets: [
        "Conservare il tempo: Tenere i tempi non modificati.",
        "Conservare l'allineamento: mantenere i modelli di allineamento non modificati.",
        "Proteggi il formato Info: Moduli di informazione del formato Shield.",
        "Proteggere la versione Info: Moduli di informazione versione Shield.",
      ],
    },
    {
      heading: "Modalità ECC-Aware",
      paragraphs: [
        "Distribuisce in modo intelligente l'intensità del sovrapposizione in base alla capacità di correzione degli errori. Il sistema analizza quali moduli possono essere modificati mantenendo la scansione.",
      ],
      bullets: [
        "Risk Budget: Percentuale di capacità di correzione degli errori da utilizzare (0-100%).",
        "Bilancio più alto = sovrapposizione più visibile ma più rischiosa scannability.",
        "Bilancio inferiore = scansione più sicura ma sovrapposizione meno visibile.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#overlay",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Opzioni di rendering professionali",
      paragraphs: ["Controlli di rendering avanzati:"],
      bullets: [
        "Crisp Edges: Utilizzare il rendering dell'immagine pixelated per i bordi del modulo taglienti.",
        "Pixel Snap: allineamento dei pixel del pavimento, rotondo o del soffitto.",
        "Modalità colore Per-Module: Solido, Per Luminosità, Per Posizione, Per Sovrapposizione, Da Cluster.",
        "Colore Palette: Definire la tavolozza di colori personalizzata per la colorazione per modulo.",
        "Protezione contrasto: assicura il rapporto di contrasto minimo tra i colori.",
        "Min Contrast Ratio: requisito di contrasto in stile WCAG (1:1 a 21:1).",
        "Bordo extra Moduli: confine aggiuntivo oltre zona tranquilla.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#render",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Opzioni di uscita professionali",
      paragraphs: ["Impostazioni di esportazione delle imprese:"],
      bullets: [
        "DPI: Impostare la risoluzione di stampa (72-600 DPI). 300 DPI consigliati per la stampa.",
        "Include Zona tranquilla: Toggle zona tranquilla in dimensioni di uscita.",
        "Esporta come addizionale: Generare PDF insieme al formato primario.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#output",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Impostazioni di animazione (Professional)",
      paragraphs: ["Ulteriori funzioni di animazione professionale:"],
      bullets: [
        "Temporale Dither: Off, Blue Noise, o Flicker Safe per-frame dithering.",
        "Modello: Nessuno, Pulse, Onda, Scanline, Shimmer, o effetti di derivazione.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#animation",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
        {
          href: "/learn?lang=${lang}#section-4",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: "API Riferimento",
      paragraphs: [
        "ANQR fornisce un API lato server per generare codici QR tramite parametri URL. Questo è ideale per incorporare codici QR in siti web, email, documenti o flussi di lavoro automatizzati senza JavaScript lato client.",
        "URL di base: https://anqr.link/api/qr",
      ],
      links: [
        { href: "/examples?lang=${lang}", label: "Visualizza esempi di QR", type: "example" },
      ],
    },
    {
      heading: "Parametri di base",
      paragraphs: ["Parametri richiesti e comuni (i nomi dei parametri non sono tradotti):"],
      bullets: [
        "dati (richiesto): Il contenuto per codificare nel codice QR. URL-encode caratteri speciali.",
        "dimensione: formato immagine in pixel (default: 400, max: 2000). Utilizzato se w/h non specificato.",
        "w, h: larghezza di uscita e altezza in pixel. Overrides formato parametro.",
        "formato: Formato di uscita - png, webp o gif (default: png).",
        "ec: livello di correzione degli errori - L, M, Q o H (default: H).",
        "fg: Colore principale come esagonale senza # (default: 000000).",
        "bg: Colore sfondo come hex senza # (default: ffffffff).",
        "trasparente: Set a 1 per sfondo trasparente.",
        "margine: Zona tranquilla in moduli (default: 4).",
      ],
    },
    {
      heading: "Parametri di stiratura",
      paragraphs: ["Modulo e modello di styling:"],
      bullets: [
        "stile: Modulo stile - quadrato, arrotondato, punti, diamante, collegato.",
        "cercatore: Stile del modello del Finder - quadrato, arrotondato, cerchio.",
        "align: Alignment pattern style - match_finder, quadrato, arrotondato, cerchio.",
        "tempistiche: Timing stile pattern - match_module, solido, schiacciato.",
        "raggio: percentuale di raggio d'angolo 0-100.",
        "gap: percentuale di gap modulo 0-50.",
        "gapMode: Modalità Gap - nessuno, inset, ictus, negativo_space.",
        "occhio occhio Outer, eyeInner: Occhio stili - quadrato, arrotondato, cerchio.",
        "occhiale: Percentuale di scala degli occhi (default: 100).",
        "grad: Gradiente tipo - nessuno, lineare, radiale, conico.",
        "gradAngle: angolo gradiente per gradienti lineari.",
        "gradStops: Gradient si ferma come colore1,pos1,color2,pos2,... (ad esempio, ff0000,0,0000ff,1).",
      ],
    },
    {
      heading: "Parametri di sovrapposizione",
      paragraphs: [
        "Opzioni di sovrapposizione dell'immagine (l'immagine sovrapposizione è lato server recuperato):",
      ],
      bullets: [
        "img: URL per sovrapporre l'immagine (deve essere pubblicamente accessibile).",
        "modalità: Modalità overlay - centro, halftone, blend, luminosità, mosaico, dithered, blue-noise, subpixel.",
        "intensità: intensità di sovrapposizione 0-100 (default: 100).",
        "colore Modalità: Modalità colore sovrapposizione - colore, scala di grigi, bw.",
        "fit: Come sovrapposizione - coprire, contenere, stretch.",
        "rotazione in gradi.",
        "flipX, flipY: imposta su 1 per capovolgere la sovrapposizione.",
        "continua Cercatori: Conservare i modelli di ricerca (default: 1).",
        "continua Timing, mantenereAllineare: Impostare a 1 per preservare tempi / schemi di allineamento.",
      ],
    },
    {
      heading: "Parametri di preelaborazione",
      paragraphs: ["Preelaborazione dell'immagine applicata a sovrapposizione:"],
      bullets: [
        "luminosità: Regolazione -100 a 100 (default: 0).",
        "contrasto: Regolazione -100 a 100 (default: 0).",
        "gamma: valore 0,1 a 3 (default: 1).",
        "saturazione: Regolazione -100 a 100 (default: 0).",
        "hue rotazione in gradi.",
        "blur: Blur in pixel.",
        "nitidezza: Affilato importo 0-100.",
        "posterize: Posterizzare i livelli.",
        "soglia: Soglia binaria 0-255.",
        "bordo: rilevamento bordo - off, sobel, canny.",
        "inverti: impostare su 1 per invertire i colori.",
      ],
    },
    {
      heading: "Parametri di filigrana",
      paragraphs: ["Aggiungi filigrane ai codici QR generati:"],
      bullets: [
        "wmEn: impostare su 1 per abilitare la filigrana.",
        "# Tipo: Tipo di filigrana - testo, immagine, modello.",
        "wmText: testo di filigrana (URL codificato).",
        "wmImg: URL per aggiungere la filigrana all'immagine.",
        "wmPos: Posizione - centro, angoli, bordi, dietro, zona tranquilla.",
        "wmOpacity: Opacity 0-100 (default: 50).",
        "wmBlend: modalità Blend - normale, moltiplicare, schermo, sovrapposizione.",
      ],
    },
    {
      heading: "Parametri di animazione",
      paragraphs: ["Per l'uscita GIF animata (richiede formato=gif):"],
      bullets: [
        "articolo Modello: Modello di animazione - nessuno, polso, onda, scanline, shimmer, deriva, colore_ciclo.",
        "anim Cornici: Numero di cornici 1-60 (default: 24).",
        "articolo Velocità: ritardo della struttura in millisecondi 10-1000 (default: 100).",
        "anim Semi: seme casuale per l'animazione.",
        "easing: Animazione easing - lineare, easy_in, easy_out, easy_in_out, rimbalzo.",
      ],
    },
    {
      heading: "Parametri di uscita",
      paragraphs: ["Opzioni di formato di uscita:"],
      bullets: [
        "qualità: qualità WebP 0-1 (default: 0.9).",
        "webpQ: qualità WebP 0-100 (default: 90).",
        "gifColori: dimensioni tavolozza GIF 2-256 (default: 256).",
        "dpi: DPI di uscita per PNG (default: 72).",
        "metaTitle, metaAuthor, metaCopy, meta Desc: campi di metadati PNG.",
      ],
    },
    // Crop Parameters
    {
      heading: "Parametri di ritaglio",
      paragraphs: ["Opzioni di ritaglio delle immagini sovrapposte:"],
      bullets: [
        "cropEn: abilita il ritaglio sovrapposto 0/1 (impostazione predefinita: 0).",
        "cropX: centro di ritaglio X come frazione 0-1 (impostazione predefinita: 0,5).",
        "cropY: centro di ritaglio Y come frazione 0-1 (impostazione predefinita: 0,5).",
        "cropSize: dimensione del ritaglio come frazione dell'immagine 0-1 (impostazione predefinita: 1).",
      ],
    },
    // Safety Lock Parameters
    {
      heading: "Parametri del blocco di sicurezza",
      paragraphs: ["Controlla quali elementi QR sono protetti dalla modifica dell'overlay:"],
      bullets: [
        "lockF: Blocca modelli di ricerca 0/1 (predefinito: 1).",
        "lockT: Blocca i pattern di temporizzazione 0/1 (default: 1).",
        "lockA: blocca i modelli di allineamento 0/1 (impostazione predefinita: 1).",
        "lockFmt: blocca le informazioni sul formato 0/1 (predefinito: 1).",
        "lockV: blocca le informazioni sulla versione 0/1 (predefinito: 1).",
        "safeMode: modalità di sicurezza: disattivata, bilanciata, rigorosa (impostazione predefinita: disattivata).",
        "safeMinPx: dimensione minima del modulo in pixel (impostazione predefinita: 2).",
        "safeMinQz: moduli minimi di zona tranquilla (impostazione predefinita: 4).",
      ],
    },
    // Auto-tuning Parameters
    {
      heading: "Parametri di autotuning",
      paragraphs: ["Impostazioni di ottimizzazione automatica:"],
      bullets: [
        "autoVer: selezione automatica della versione QR 0/1 (impostazione predefinita: 1).",
        "autoEcc: selezione automatica del livello ECC 0/1 (impostazione predefinita: 0) - solo suggerimento lato server.",
        "autoReduce: [CLIENT-ONLY] Riduce automaticamente l'intensità finché non è possibile eseguire la scansione: richiede un ciclo di convalida della scansione.",
      ],
    },
    // Additional Animation Parameters
    {
      heading: "Parametri di animazione aggiuntivi",
      paragraphs: ["Controlli di animazione estesi per l'output GIF:"],
      bullets: [
        "loop: l'animazione si ripete continuamente 0/1 (impostazione predefinita: 1).",
        "rimbalzo: direzione dell'animazione ping-pong 0/1 (impostazione predefinita: 0).",
        "reverse: Riproduce l'animazione al contrario 0/1 (default: 0).",
        "colorCycle: abilita l'effetto ciclo colore 0/1 (impostazione predefinita: 0).",
        "interp: interpolazione dei fotogrammi - nessuna, dissolvenza incrociata, morph (impostazione predefinita: nessuna).",
        "tempDither: dithering temporale - off, blue_noise, flicker_safe (default: off).",
        "startF: fotogramma iniziale dell'animazione (default: 0).",
        "maxF: numero massimo di fotogrammi da renderizzare (impostazione predefinita: 0 = auto).",
        "stepF: intervallo del passo del frame (default: 1).",
        "jitter: [SOLO CLIENT] Jitter del modulo in pixel: richiede la rigenerazione QR per fotogramma.",
      ],
    },
    // Dithering Parameters
    {
      heading: "Parametri di dithering",
      paragraphs: [
        "Controlla gli algoritmi di dithering per l'elaborazione della sovrapposizione:",
      ],
      bullets: [
        "ditherKind: algoritmo dither - error_diffusion, order_bayer, blue_noise, ecc. (default: order_bayer).",
        "diffusionKernel: Errore diffusion kernel - floyd_steinberg, jarvis_judice_ninke, sticki, burkes, sierra, atkinson (predefinito: floyd_steinberg).",
        "ditherStrength: intensità del dithering 0-100 (impostazione predefinita: 50).",
        "serpentino: dithering serpentino 0/1 (predefinito: 0).",
        "matrice: matrice dither ordinata - bayer2, bayer4, bayer8 (impostazione predefinita: bayer4).",
        "bnTile: dimensione della tessera rumore blu (impostazione predefinita: 64).",
        "bnSeed: seme casuale del rumore blu (impostazione predefinita: 0).",
        "colorDither: dithering del colore - nessuno, per_canale, percettivo (impostazione predefinita: nessuno).",
      ],
    },
    // Subpixel Parameters
    {
      heading: "Parametri subpixel",
      paragraphs: ["Impostazioni per la modalità di fusione subpixel:"],
      bullets: [
        "spGrid: dimensione della griglia subpixel: 2x2, 3x3, 4x4 (impostazione predefinita: 3x3).",
        "spCenter: regola centrale - rigorosa, halftone_center (impostazione predefinita: rigorosa).",
        "spNeutral: colore esadecimale neutro senza # (default: 808080).",
        "spFinder: sostituzione del Finder: solido, stilizzato (impostazione predefinita: solido).",
      ],
    },
    // Halftone Parameters
    {
      heading: "Parametri dei mezzitoni",
      paragraphs: ["Impostazioni per la modalità di fusione mezzitoni:"],
      bullets: [
        "htCell: dimensione della cella dei mezzitoni - per_module o griglia nxn (impostazione predefinita: per_module).",
        "htDot: forma del punto: cerchio, quadrato, linea (predefinito: cerchio).",
        "htCurve: curva di luminosità - lineare, curva a S, gamma (impostazione predefinita: lineare).",
        "duo1: colore esadecimale dell'ombra in due tonalità senza # (impostazione predefinita: 000000).",
        "duo2: colore esadecimale in due tonalità senza # (impostazione predefinita: ffffff).",
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: "Parametri della modalità compatibile con ECC",
      paragraphs: [
        "Distribuzione sovrapposta intelligente basata sulla capacità di correzione degli errori:",
      ],
      bullets: [
        "eccAware: attiva la modalità compatibile con ECC 0/1 (impostazione predefinita: 0).",
        "eccRisk: percentuale del budget di rischio 0-100 (default: 50).",
        "eccMap: mappa del peso - distance_to_finders, block_heatmap, empirical_scan_heatmap (impostazione predefinita: distance_to_finders).",
      ],
    },
    // Frame Parameters
    {
      heading: "Parametri del fotogramma",
      paragraphs: ["Impostazioni della cornice decorativa:"],
      bullets: [
        "cornice: stile cornice: nessuno, cornice_arrotondata, adesivo, tag (impostazione predefinita: nessuno).",
        "frameText: testo da visualizzare nel frame (codificato URL).",
      ],
    },
    // Per-Module Color Parameters
    {
      heading: "Parametri colore per modulo",
      paragraphs: ["Opzioni di colorazione dei singoli moduli:"],
      bullets: [
        "modColor: modalità colore: solido, by_brightness, by_position, by_overlay, by_cluster (impostazione predefinita: solido).",
        "cGuard: guardia contrasto 0/1 (predefinito: 0).",
        "minContrast: rapporto di contrasto minimo 1-21 (predefinito: 4,5).",
        "tavolozza: colori esadecimali separati da virgole per la modalità tavolozza.",
        "paletteMode: distribuzione della tavolozza: posizione, luminosità, diagonale, radiale, casuale, riga, colonna (impostazione predefinita: posizione).",
      ],
    },
    // GIF Overlay Parameters
    {
      heading: "Parametri di sovrapposizione GIF",
      paragraphs: ["Impostazioni per le immagini sovrapposte GIF animate:"],
      bullets: [
        "ovType: tipo di sovrapposizione: statico, gif, apng, webp_anim, video (impostazione predefinita: statico).",
        "ovFramePick: selezione fotogrammi - tutti, ogni_n, max_frames, durata_limit (predefinito: tutti).",
        "gifDelays: utilizza i ritardi dei fotogrammi GIF originali 0/1 (impostazione predefinita: 1).",
        "gifDispH: gestione dell'eliminazione delle GIF: rispetto, semplificazione (impostazione predefinita: rispetto).",
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: "Limiti di intensità per ECC",
      paragraphs: ["Intensità massima di sovrapposizione per livello di correzione degli errori:"],
      bullets: [
        "maxIntL: intensità massima per ECC L 0-100 (impostazione predefinita: 100).",
        "maxIntM: intensità massima per ECC M 0-100 (impostazione predefinita: 100).",
        "maxIntQ: intensità massima per ECC Q 0-100 (impostazione predefinita: 100).",
        "maxIntH: intensità massima per ECC H 0-100 (impostazione predefinita: 100).",
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: "Parametri di simulazione QA (solo client)",
      paragraphs: [
        "Questi parametri vengono analizzati per la compatibilità URL ma funzionano solo nel browser:",
      ],
      bullets: [
        "qaContrast: abilita il controllo del contrasto 0/1: richiede la convalida interattiva.",
        "qaBlur: simula la sfocatura in pixel - solo per test interattivi.",
        "qaNoise: simula il livello di rumore - solo per test interattivi.",
        "qaHeatmap: mostra la mappa termica di leggibilità 0/1: richiede l'interfaccia utente in sovrapposizione su tela.",
      ],
    },
    // Client-Only Parameters
    {
      heading: "Parametri solo client",
      paragraphs: [
        "La maggior parte dei parametri API sono completamente supportati sul lato server. I parametri contrassegnati [CLIENT-ONLY] vengono analizzati per la compatibilità URL ma richiedono funzionalità del browser:",
      ],
      bullets: [
        "jitter: il jitter del modulo richiede la rigenerazione QR per fotogramma con casualità.",
        "autoReduce: la riduzione automatica dell'intensità richiede test di scansione iterativi.",
        "qaContrast, qaBlur, qaNoise, qaHeatmap: la simulazione del QA richiede la convalida del canvas interattivo.",
      ],
    },
    // Additional Output Parameters
    {
      heading: "Parametri di output aggiuntivi",
      paragraphs: ["Impostazioni estese di output ed esportazione:"],
      bullets: [
        "fname: nome file personalizzato per i download (predefinito: anqr-qrcode).",
        "inclQz: include la zona silenziosa nelle dimensioni di output 0/1 (impostazione predefinita: 1).",
        "bgOver: il colore di sfondo sovrascrive esadecimale senza # (sostituisce il parametro bg).",
        "fmtExtra: formato di output aggiuntivo: nessuno, eps, animato_webp (impostazione predefinita: nessuno). Nota: eps è [PARZIALE].",
        "svgPrec: precisione della forma SVG - pixel, precisa (impostazione predefinita: pixel). [PARZIALE] Output SVG limitato sul lato server.",
        "svgEmbed: incorpora la sovrapposizione raster in SVG 0/1 (impostazione predefinita: 1). [PARZIALE] Output SVG limitato sul lato server.",
        "modulePx: dimensione in pixel del modulo (impostazione predefinita: calcolata automaticamente dalla dimensione).",
        "border: Moduli di confine extra oltre la zona tranquilla (default: 0).",
        "nitido: attiva il rendering delle immagini nitide/pixellate 0/1 (impostazione predefinita: 1).",
        "snap: modalità Pixel snap: pavimento, rotondo, soffitto (predefinito: pavimento).",
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: "Parametri di conservazione del modello",
      paragraphs: ["Controlla quali elementi strutturali sono protetti dalla sovrapposizione:"],
      bullets: [
        "keepFinders: preserva i modelli di ricerca 0/1 (impostazione predefinita: 1).",
        "keepTiming: preserva i modelli di temporizzazione 0/1 (impostazione predefinita: 0).",
        "keepAlign: preserva i modelli di allineamento 0/1 (impostazione predefinita: 0).",
        "ProtectFmt: protegge i moduli informativi del formato 0/1 (impostazione predefinita: 0).",
        "ProtectVer: protegge i moduli informativi sulla versione 0/1 (impostazione predefinita: 0).",
      ],
    },
    {
      heading: "Esempio di utilizzo",
      paragraphs: [
        "Codice QR:",
        "https://anqr.link/api/qr?data=https://example.com",
        "Codice QR con colori personalizzati:",
        "https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30",
        "Codice QR con immagine overlay:",
        "https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70",
        "GIF Animato:",
        "https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out",
      ],
      links: [
        { href: "/examples?lang=${lang}", label: "Visualizza esempi di QR", type: "example" },
      ],
    },
    {
      heading: "Codici QR Embedding",
      paragraphs: [
        "In modalità Professional, la funzione Condividi genera HTML e URL incorporabili. Ecco come funziona l'integrazione:",
      ],
      bullets: [
        "Share Link: Crea un URL all'app ANQR con tutte le impostazioni codificate come parametri URL. I destinatari possono visualizzare e modificare il codice QR.",
        "Embed Image: Genera un tag <img> che indica l'API del server. Il codice QR è reso lato server e servito come immagine.",
        "Embed Markdown: crea la sintassi di immagine di Markdown per la documentazione e i file README.",
        "URL API diretta: L'URL API raw per l'utilizzo in applicazioni, script o altre integrazioni.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
    {
      heading: "Esempio HTML",
      paragraphs: [
        "Per inserire un codice QR nel tuo sito web:",
        '<img src=\\"https://anqr.link/api/qr?data=https://yoursite.com&size=200\\" alt=\\"QR Code\\" />',
        "Per il dimensionamento reattivo:",
        '<img src=\\"https://anqr.link/api/qr?data=https://yoursite.com&size=400\\" alt=\\"QR Code\\" style=\\"max-width: 100%; altezza: auto\\" />',
        "Le risposte della cache del server con lunghe intestazioni della cache, così le richieste ripetute per lo stesso URL sono veloci.",
      ],
    },
    {
      heading: "Condividere il formato URL",
      paragraphs: [
        "Quando si fa clic su Condividi in modalità Professional, ANQR codifica le impostazioni correnti in parametri URL. Il formato è:",
        "https://anqr.link/?data=...&ec=H&style=rounded&....",
        "Questi parametri rispecchiano i parametri API, in modo da poter convertire un URL di condivisione in un URL API modificando il percorso di base da / a /api/qr e regolando i parametri w/h come necessario.",
        "Nota: Le immagini sovrapposizioni caricate dai file locali non possono essere condivise tramite URL: solo gli overlay basati su URL (parametro img) funzionano nei link condivisi e nelle chiamate API.",
      ],
    },
    {
      heading: "Limiti di tasso e utilizzo",
      paragraphs: [
        "L'API è gratuita da usare per volumi ragionevoli. Per l'utilizzo ad alto volume o applicazioni commerciali che richiedono tempi di inattività garantiti, vi preghiamo di contattarci.",
        "Le risposte API includono intestazioni di caching aggressive. Per le migliori prestazioni, le risposte della cache sulla tua fine o utilizzare lo stesso URL costantemente per i codici QR identici.",
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: "Migliori Pratiche",
      paragraphs: ["Seguire queste linee guida per codici QR affidabili:"],
      bullets: [
        "Prova sempre i codici QR con più app scanner prima della stampa.",
        "Utilizzare Correzione di errore H (alto) quando si aggiungono sovrapposizioni.",
        "Tenere almeno 4 moduli di zona tranquilla (margin).",
        "Assicurare un elevato contrasto tra primo piano e sfondo.",
        "Per la stampa, utilizzare almeno 300 DPI e testare a dimensioni reali di stampa.",
        "Abilita i modelli di ricerca preserve quando si utilizza overlays.",
        "Iniziare con intensità di sovrapposizione inferiore e aumentare gradualmente.",
        "Per uso esterno, prendere in considerazione le dimensioni del modulo più grandi e la correzione di errore più alta.",
      ],
      links: [
        { href: "/learn?lang=${lang}", label: "Sfoglia gli articoli", type: "learn" },
        { href: "/examples?lang=${lang}", label: "Visualizza esempi di QR", type: "example" },
      ],
    },
    {
      heading: "Risoluzione dei problemi",
      paragraphs: ["Questioni e soluzioni comuni:"],
      bullets: [
        "Il QR non esegue la scansione: Ridurre l'intensità di sovrapposizione, aumentare la correzione di errore, controllare il contrasto.",
        "Codice troppo grande: Ridurre la lunghezza del contenuto, utilizzare abbreviatore URL, versione inferiore.",
        "Uscita Blurry: Aumentare la dimensione del modulo, utilizzare PNG invece di formati compressi.",
        "I colori sembrano sbagliati: Controlla il contrasto di colore, prova la modalità overlay di scala grigia.",
        "GIF non si anima: Assicurarsi di utilizzare l'uscita del formato GIF, controllare il conteggio del frame.",
        "Sovrapposizione immagine non caricamento: Controllare le autorizzazioni CORS su immagini remote.",
      ],
      links: [
        {
          href: "/learn?lang=${lang}#section-5",
          label: "Vedere le guide e gli esempi correlati",
          type: "learn",
        },
      ],
    },
    {
      heading: "Tastiera Scorciatoie",
      paragraphs: [
        "ANQR supporta scorciatoie da tastiera standard. Utilizzare Ctrl/Cmd+S per avviare l'esportazione (quando focalizzato sull'anteprima).",
      ],
    },
    {
      heading: "Condivisione e integrazione",
      paragraphs: [
        "In modalità Professional, fare clic sul pulsante Condividi per copiare un URL con le impostazioni correnti. I destinatari possono aprire questo URL per vedere la configurazione esatta. Nota: Le immagini overlay dai file locali non possono essere condivise tramite URL.",
      ],
      links: [
        {
          href: "/?lang=${lang}&tab=professional#share",
          label: "Prova questa configurazione direttamente nel generatore ANQR.",
          type: "generator",
        },
      ],
    },
  ],
  relatedLinks: [
    { href: "/learn?lang=${lang}", label: "Sfoglia gli articoli", type: "learn" },
    { href: "/examples?lang=${lang}", label: "Visualizza esempi di QR", type: "example" },
    { href: "/gallery?lang=${lang}", label: "Visualizza esempi di QR", type: "gallery" },
    { href: "/?lang=${lang}", label: "Aprire il generatore", type: "generator" },
  ],
};

export default guide;
