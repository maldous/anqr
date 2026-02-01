import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

/**
 * Template for the Learn page.
 * All string values are numeric ids that map to lines in en-GB.txt.
 * Structure is FLAT - each subsection is a top-level section.
 */
export const learn: PageDefinition = {
  title: 'Scopri con ANQR',
  description: 'Guide pratiche e business-first per trasformare i codici QR in beni di marketing reali - non solo quadrati funzionali. Scopri come aggiornare i codici del punto di vendita legacy, creare la segnaletica QR di pagamento conforme, preparare le esportazioni di stampa pronti, utilizzare l\'animazione in modo sicuro su display digitali, e condividere le configurazioni bloccate in team multilingue utilizzando i link ANQR ("anchor").',
  lastUpdated: LAST_UPDATED,

  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Aprire il generatore', type: 'generator' },
    { href: '/examples?lang=${lang}', label: 'Visualizza esempi di QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Aprire la guida utente completa', type: 'guide' },
  ],

  sections: [
    // Guide 1: Improving Existing QR Campaigns
    {
      heading: 'Migliorare le campagne QR esistenti',
      paragraphs: ['La maggior parte delle aziende hanno codici QR sparsi attraverso le loro operazioni - su menu, controstalli, imballaggi e materiali promozionali. Molti di questi codici sono stati creati anni fa con generatori di base, con conseguente generico quadrati neri e bianchi che non riescono a ispirare fiducia o abbinare la vostra identità di marca. Questa guida completa ti accompagna attraverso un approccio sistematico al controllo, all\'aggiornamento e all\'ottimizzazione dell\'infrastruttura QR esistente senza interrompere i viaggi dei clienti che hai già stabilito.', 'Il vantaggio strategico di aggiornare piuttosto che sostituire i codici QR sta nel preservare la continuità. I vostri clienti hanno già imparato ad aspettarsi determinate destinazioni quando analizzano i vostri codici. Mantenendo gli URL codificati identici mentre migliora notevolmente la presentazione visiva, l\'affidabilità della scansione e l\'allineamento del marchio, si crea una transizione senza soluzione di continuità che migliora la fiducia senza richiedere modifiche all\'infrastruttura digitale o al monitoraggio di analisi.'],
      images: [
        {
          src: '/images/learn/improve-existing-overview.png',
          alt: 'Un confronto side-by-side che mostra un codice QR sbiadito e generico accanto a una versione moderna di marca che codifica lo stesso URL',
          caption: 'Prima e dopo: Lo stesso URL di destinazione trasformato da un codice generico datato a un bene di marca professionale',
        },
      ],
    },
    {
      heading: 'Perché Legacy QR Codes Underperform',
      paragraphs: ['Codici QR creati durante la fase di adozione precoce - in particolare durante il 2020-2021 quando le aziende si sono precipitate ad implementare soluzioni contactless - spesso soffrono di diversi problemi critici. Le basse impostazioni di correzione degli errori li rendono fragili quando vengono stampate su superfici texture o visualizzate sotto l\'illuminazione impegnativa. Le zone silenziose insufficienti causano errori di scansione quando i codici sono posizionati vicino ad altri elementi visivi. Lo stile generico non riesce a comunicare la legittimità del marchio, che porta all\'esitazione e ai tassi di scansione ridotti.', 'Oltre ai limiti tecnici, i codici legacy spesso rappresentano opportunità di branding perse. Ogni QR code è un punto di contatto con il vostro cliente - un momento in cui sono attivamente impegnati e disposti ad agire. Un codice professionale che corrisponde ai colori del tuo marchio, include margini di sicurezza appropriati, e le caratteristiche degli elementi marcati opzionali trasformano questa utility in un asset di marketing che rafforza la tua identità in ogni interazione.'],
    },
    {
      heading: 'Condurre un codice QR Audit',
      paragraphs: ['Inizia il tuo progetto di aggiornamento creando un inventario completo di ogni codice QR attualmente implementato attraverso il tuo business. Documentare la posizione fisica, la destinazione codificata, la condizione attuale del materiale stampato, e l\'ambiente di scansione tipico tra cui condizioni di illuminazione e angoli di visione. Testare ogni codice con più dispositivi - smartphone più vecchi e dispositivi di bilancio spesso rivelano problemi di affidabilità che i telefoni premium mascherano.', 'Prestare particolare attenzione ai codici in posizioni di alto livello: punti di pagamento, aree di check-in e display promozionali in cui la scansione guasto influisce direttamente sulle entrate o sull\'esperienza del cliente. Questi dovrebbero essere prioritari per l\'aggiornamento immediato. Nota anche i codici che appaiono in fotografia o contenuti video, in quanto questi richiederanno il coordinamento con il vostro team di marketing per aggiornare i beni visivi.'],
      images: [
        {
          src: '/images/learn/improve-existing-audit.png',
          alt: 'Un\'interfaccia di checklist che mostra le categorie di audit QR: posizione, condizione, affidabilità della scansione e valutazione prioritaria',
          caption: 'Modello di audit QR sistematico per la documentazione e la priorità dei candidati all\'aggiornamento',
        },
      ],
    },
    {
      heading: 'La strategia di aggiornamento sicura',
      paragraphs: ['La regola cardinale degli aggiornamenti QR è la conservazione della destinazione. Estrarre l\'URL esatto da ogni codice esistente e codificarlo in modo identico nella nuova versione. Ciò garantisce che tutte le aspettative di analisi, redirect logic e clienti esistenti rimangano intatte. Se avete bisogno di flessibilità di destinazione per gli aggiornamenti futuri, questo è il momento ideale per introdurre un URL breve marcato o un servizio di reindirizzamento - ma implementare questo come un progetto separato per evitare cambiamenti di composto.', 'Per l\'aggiornamento visivo, applicare miglioramenti negli strati: prima garantire l\'affidabilità tecnica (correzione di errore appropriata e zona tranquilla), poi aggiungere lo styling del marchio (colori, forme di modulo), e infine prendere in considerazione miglioramenti opzionali (overlay di centro, cornici). Ogni strato deve essere convalidato tramite test prima di procedere. La modalità di sicurezza di ANQR aiuta a far rispettare queste priorità avvisando quando le scelte di styling potrebbero compromettere la scansione.'],
    },
    {
      heading: 'Aggiunta di identità di marca senza Compromising Affidabilità',
      paragraphs: ['Efficace QR branding bilancia l\'impatto visivo contro l\'affidabilità della scansione. Iniziare con il colore: sostituire il primo piano nero predefinito con il colore del tuo marchio primario, garantendo un contrasto sufficiente sul tuo sfondo. Per la maggior parte delle marche, i colori scuri su sfondi leggeri funzionano meglio. Evitare combinazioni a basso contrasto, gradienti che riducono la chiarezza del bordo, o colori che appaiono simili in condizioni di illuminazione comuni.', 'La personalizzazione della forma del modulo offre un\'altra opportunità di branding con un minimo impatto sull\'affidabilità. I moduli arrotondati creano un aspetto più morbido e avvicinabile mantenendo un\'eccellente scansione. I moduli Dot-style funzionano bene per i marchi moderni e tech-forward. I moduli collegati si adattano alle identità industriali o aziendali. Qualunque stile tu scelga, mantieni la coerenza tra tutte le tue implementazioni QR per il riconoscimento immediato del marchio.'],
      images: [
        {
          src: '/images/learn/improve-existing-branding.png',
          alt: 'Un diagramma della ruota a colori che mostra combinazioni cromatiche ottimali con indicatori di contrasto',
          caption: 'Guida alla selezione di colori di marca che mostra combinazioni ad alto contrasto che mantengono l\'affidabilità della scansione',
        },
      ],
    },
    {
      heading: 'Protocollo di prova e convalida',
      paragraphs: ['Mai implementato i codici QR senza rigorosi test. Stampare una prova fisica alla dimensione esatta e sullo stesso materiale della distribuzione finale. Prova nella posizione reale dove il codice vivrà, in tempi diversi di giorno per spiegare le variazioni di illuminazione. Utilizzare almeno tre diversi dispositivi: un telefono di punta corrente, un dispositivo di fascia media, e uno smartphone vecchio o di bilancio.', 'Registra i tempi di scansione e i tassi di successo per ogni test. Un codice ben ottimizzato dovrebbe eseguire la scansione entro 1-2 secondi su qualsiasi dispositivo ragionevolmente moderno. Se state vedendo ritardi o guasti coerenti, ridurre l\'intensità dello styling - rimuovere o ridurre i sovrapposizioni, aumentare la dimensione della zona tranquilla, o passare a un livello di correzione di errore superiore. L\'affidabilità ha sempre la precedenza sulla sofisticazione visiva.'],
    },
    {
      heading: 'Bloccare la configurazione per la coerenza',
      paragraphs: ['Una volta validata una configurazione ottimale, conservatela utilizzando i link condivisibili di ANQR. Questo crea un record permanente di ogni impostazione utilizzata per generare il codice approvato - colori, stile modulo, correzione di errore, dimensionamento e eventuali sovrapposizioni. Condividi questo link con il tuo team di progettazione, fornitori di stampa e chiunque abbia bisogno di riprodurre il codice in futuro.', 'Questa serratura di configurazione impedisce il graduale degrado che affligge molte implementazioni QR. Senza di esso, i membri del personale ricreano i codici dagli screenshot, i progettisti ricostruiscono le impostazioni dalla memoria e i fornitori di stampa fanno le regolazioni \'utili\'. Ogni variazione introduce potenziali problemi. Con un link di configurazione bloccato, ogni riproduzione è identica al tuo originale testato e approvato.'],
      images: [
        {
          src: '/images/learn/improve-existing-lock.png',
          alt: 'Un diagramma che mostra la configurazione deriva: gli screenshot che portano a ricreazioni che portano a varianti, rispetto ad un unico collegamento sorgente-di-verità',
          caption: 'Prevenire la deriva di configurazione stabilendo una singola fonte autorevole per tutte le riproduzioni QR',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced&ec=H#overlay',
          label: 'Aprire il generatore',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Visualizza esempi di QR',
          type: 'example',
        },
      ],
    },

    // Guide 2: QR Codes for Retail Payments
    {
      heading: 'Codici QR per i pagamenti al dettaglio',
      paragraphs: ['I codici QR di pagamento operano nell\'ambiente più esigente al dettaglio: il momento della transazione. I clienti sono pronti a pagare, spesso con una coda che si forma dietro di loro, e ogni secondo di ritardo crea attrito. Eppure questo momento ad alta pressione è anche primo immobiliare per il rinforzo del marchio. Questa guida spiega come creare codici QR di pagamento che scansionano istantaneamente le app bancarie, presentando ancora un aspetto professionale e marcato che costruisce la fiducia del cliente.', 'Il principio fondamentale per il pagamento dei codici QR è l\'affidabilità rispetto all\'estetica. Un codice ben progettato che non riesce a scansionare su un\'app bancaria del cliente ti costerà molto di più nelle transazioni abbandonate e clienti frustrati che un design conservatore mai potrebbe. Iniziare con la conformità, aggiungere l\'affidabilità, quindi accuratamente strato nel branding solo dove non compromette la funzione primaria.'],
      images: [
        {
          src: '/images/learn/retail-payments-overview.png',
          alt: 'Un display del contatore al dettaglio che mostra un codice QR di pagamento che viene scansionato da uno smartphone con un\'app bancaria',
          caption: 'I codici QR devono lavorare istantaneamente con le applicazioni bancarie e portafoglio in condizioni di contatore reali',
        },
      ],
    },
    {
      heading: 'Comprensione degli standard QR di pagamento',
      paragraphs: ['I codici QR di pagamento tipicamente seguono gli standard regionali che dettano il formato payload. A Singapore, PayNow QR utilizza una formattazione specifica. In India, i codici UPI seguono gli standard di collegamento BharatQR o UPI. I pagamenti SEPA europei utilizzano codici QR EPC. Ogni standard esiste per garantire che le applicazioni bancarie possano immediatamente riconoscere e elaborare le informazioni di pagamento. Deviare da questi standard - anche leggermente - può causare applicazioni di pagamento per rifiutare i codici che gli scanner della fotocamera generici leggono senza problemi.', 'ANQR include modelli per i principali standard di pagamento che formattano automaticamente i dettagli del commerciante in payload conformi. Utilizzare sempre questi modelli piuttosto che costruire manualmente stringhe di pagamento, come anche errori di formattazione minori possono causare guasti delle transazioni. Se lo standard di pagamento della tua regione non è disponibile come modello, consulta la documentazione tecnica del tuo fornitore di pagamento per i requisiti di formattazione esatti.'],
    },
    {
      heading: 'Dimensionamento e posizionamento per display a contatore',
      paragraphs: ['I codici QR controsoffitti affrontano sfide fisiche uniche. I clienti controllano a lunghezza del braccio, spesso ad angolo, a volte attraverso le guardie starnute o i casi di visualizzazione. L\'illuminazione esterna crea punti abbaglianti. Il codice compete con altri contatori per l\'attenzione e chiare linee di vista. Dimensione il vostro pagamento QR generosamente - un minimo di 4-5cm è consigliato per la maggior parte delle applicazioni contatori, scaling up se il codice siede dietro vetro o in una zona poco illuminata.', 'La posizione conta tanto quanto le dimensioni. Posizionare il codice in cui i clienti possono tenere comodamente il telefono senza bloccare la coda o raggiungere in modo imbarazzante. Angolo il display verso il cliente piuttosto che posarlo piatto. Se possibile, utilizzare laminazione opaca o materiali di visualizzazione non riflettenti per ridurre al minimo l\'abbagliamento dall\'illuminazione superiore. Testare il posizionamento finale in diversi momenti del giorno per catturare problemi di illuminazione.'],
      images: [
        {
          src: '/images/learn/retail-payments-placement.png',
          alt: 'Un diagramma che mostra altezze e angoli ottimali di posizionamento QR per diverse configurazioni contatori',
          caption: 'Guida di posizionamento controverso: altezze ottimali, angoli e distanze per una scansione di pagamento affidabile',
        },
      ],
    },
    {
      heading: 'Conservative Branding per i codici di pagamento',
      paragraphs: ['Le applicazioni di pagamento sono meno indulgenti rispetto agli scanner generici della fotocamera. Molte applicazioni bancarie utilizzano algoritmi di lettura QR più vecchi e semplici ottimizzati per velocità piuttosto che flessibilità. Ciò significa che lo stile che funziona perfettamente con una fotocamera del telefono può fallire con app di pagamento specifiche. Mantenere il marchio conservatore: utilizzare il colore del marchio in primo piano se mantiene un forte contrasto, ma evitare gradienti, sovrapposizioni pesanti, o elementi decorativi che potrebbero interferire con il riconoscimento.', 'Se si desidera un logo centrale o overlay, mantenere estremamente piccolo - non più del 10-15% dell\'area QR - e testare ampiamente con ogni app di pagamento che i clienti potrebbero utilizzare. Molte aziende optano per nessun overlay sui codici di pagamento in particolare, riservando che lo styling per il marketing codici QR dove i requisiti di affidabilità sono meno stringenti. Il lavoro del codice di pagamento è quello di elaborare transazioni, non per impressionare visivamente.'],
      images: [
        {
          src: '/images/learn/retail-payments-branding.png',
          alt: 'Un confronto che mostra gradi di marca accettabile vs rischioso per i codici QR di pagamento',
          caption: 'Spettro di marca QR: dallo stile sicuro conservatore agli approcci decorativi rischiosi',
        },
      ],
    },
    {
      heading: 'Considerazioni materiali e stampa',
      paragraphs: ['Il materiale di visualizzazione fisico influisce significativamente sull\'affidabilità della scansione. La laminazione lucida riflette le luci della testa direttamente nella fotocamera del cliente. I materiali textured possono falsare i bordi del modulo. La stampa a basso costo può sfocare dettagli fini. Per i codici QR di pagamento, investire in qualità: utilizzare la laminazione opaca o satinata, garantire la stampa ad alta risoluzione e sostituire i display prima di mostrare l\'usura. Un codice di pagamento graffiato o sbiadito costa transazioni.', 'Considera la durata e la sostituibilità del display. I display dei controspionatori vengono toccati, spostati, spruzziti e occasionalmente rovesciati. Progettare il sistema di visualizzazione in modo che l\'inserto QR possa essere facilmente sostituito senza sostituire l\'intero stand. Tenere le stampe di ricambio pronte, generate dal vostro link di configurazione bloccato, così i codici usurati possono essere scambiati immediatamente.'],
    },
    {
      heading: 'Prova con pagamento reale Apps',
      paragraphs: ['Gli scanner della fotocamera generici decodificheranno quasi qualsiasi codice QR ragionevolmente formattato. Le applicazioni di pagamento sono più esigenti. Prima di distribuire qualsiasi codice QR di pagamento, provarlo con ogni app di pagamento che i clienti potrebbero utilizzare. In ambienti multi-pagamento, questo potrebbe significare test con più applicazioni bancarie, portafogli digitali e piattaforme di pagamento. Documento quali app hai testato e le loro versioni - le app di pagamento aggiornano frequentemente, e un aggiornamento potrebbe cambiare il comportamento di scansione.', 'Test in condizioni realistiche: il display effettivo, l\'illuminazione reale, la distanza di scansione effettiva. Un codice che scandisce istantaneamente sulla scrivania potrebbe lottare sul banco alle 17:00 quando il sole pomeridiano crea l\'abbagliamento. Prova con lo smartphone più vecchio e più economico che puoi trovare - se funziona in modo affidabile su un dispositivo di bilancio, funzionerà su tutto. Bandiera di qualsiasi tempo di scansione in 2 secondi per indagine e potenziale riprogettazione.'],
      images: [
        {
          src: '/images/learn/retail-payments-testing.png',
          alt: 'Una lista di controllo di prova che mostra varie applicazioni di pagamento, tipi di dispositivi e condizioni ambientali per verificare',
          caption: 'Comprehensive pagamento QR testing matrix copre applicazioni, dispositivi e fattori ambientali',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: 'Aprire il generatore',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-5',
          label: 'Visualizza esempi di QR',
          type: 'example',
        },
      ],
    },

    // Guide 3: Print-Ready QR Codes
    {
      heading: 'Codici QR: SVG vs PNG',
      paragraphs: ['La differenza tra un codice QR che scansiona perfettamente e uno che non riesce spesso scende a come è stato esportato e gestito nel flusso di lavoro di stampa. Questa guida spiega le distinzioni critiche tra i formati vettoriali (SVG) e raster (PNG), quando usare ciascuno, e come distribuire opere d\'arte QR a progettisti e fornitori di stampa in modi che preservano l\'affidabilità della scansione da biglietti da visita a cartelloni di dimensioni.', 'La produzione di stampa introduce variabili che non esistono sullo schermo: la diffusione dell\'inchiostro, la texture del substrato, i processi di finitura e l\'effetto cumulativo delle conversioni di file multipli. Un codice QR che sembra perfetto nel vostro software di progettazione può emergere dalla stampante con bordi ammorbiditi, ridotto contrasto, o moduli subtly distort. La comprensione della selezione del formato e delle best practice del flusso di lavoro impedisce questi fallimenti silenziosi.'],
      images: [
        {
          src: '/images/learn/print-ready-overview.png',
          alt: 'Una vista magnificata che confronta i moduli QR vettoriali con bordi nitidi rispetto ai moduli raster che mostrano artefatti pixel',
          caption: 'Vector vs raster su scala di stampa: la differenza di precisione che determina l\'affidabilità della scansione',
        },
      ],
    },
    {
      heading: 'Perché Vector (SVG) è preferito per la stampa',
      paragraphs: ['I file SVG descrivono i codici QR come forme matematiche piuttosto che reti di pixel. Ciò significa che il codice può essere scalato a qualsiasi dimensione - da un\'etichetta di 1 cm a un banner di 10 metri - senza alcuna perdita di nitidezza del bordo. RIP della stampante (Raster Image Processor) rende i vettori alla risoluzione nativa del dispositivo di uscita, assicurando che ogni bordo del modulo sia croccante come l\'hardware consente. Non c\'è interpolazione, nessun artefatto anti-aliasing, nessun blur accumulato da più operazioni di ridimensionamento.', 'Oltre alla scalabilità, i file SVG sono più robusti nei flussi di lavoro professionali. Sopravvivono alle corse attraverso software di progettazione senza degradazione. Possono essere corretti a colori senza ricampamento. Essi incorporano in modo pulito in file PDF per l\'output press-ready. Per qualsiasi applicazione di stampa in cui la qualità è importante, SVG dovrebbe essere il formato di esportazione predefinito.'],
    },
    {
      heading: 'Quando PNG è accettabile',
      paragraphs: ['PNG diventa necessario quando il flusso di lavoro o la piattaforma di destinazione non supporta i formati vettoriali. Alcune piattaforme web, sistemi CMS di segnaletica e flussi di lavoro di stampa legacy richiedono immagini raster. In questi casi, PNG può funzionare bene - ma solo se si seguono regole severe: esportare alla dimensione fisica finale e risoluzione, mai scalare dopo l\'esportazione, ed evitare qualsiasi compressione perdita o conversione di formato.', 'La regola fondamentale per PNG è calcolare le dimensioni dei pixel richiesti prima di esportare. Se il tuo QR stamperà a 5cm e la tua stampante opera a 300 DPI, hai bisogno di circa 590 pixel. Esportare a questa dimensione o più grande, quindi scalare verso il basso se necessario - mai su. Includere queste informazioni nel nome del file o metadati in modo che gli utenti futuri non abusano accidentalmente di un\'esportazione specifica dimensione.'],
      images: [
        {
          src: '/images/learn/print-ready-resolution.png',
          alt: 'Un\'interfaccia calcolatrice che mostra il rapporto tra dimensione fisica, DPI e dimensioni pixel richieste',
          caption: 'Calcolo della risoluzione di stampa: determinare le dimensioni minime dei pixel per la dimensione dell\'output di destinazione',
        },
      ],
    },
    {
      heading: 'Opzioni di esportazione ANQR Spiegate',
      paragraphs: ['ANQR offre diverse modalità di esportazione SVG per adattarsi ai diversi flussi di lavoro. La modalità True Vector produce un output basato su percorso puro ideale per strumenti di stampa e progettazione professionale. Quando hai aggiunto overlays raster o alcuni effetti, ANQR può incorporare questi, mantenendo i moduli vettoriali, o è possibile esportare una versione completamente rasterizzata alla risoluzione specificata. La comprensione di queste opzioni ti aiuta a scegliere l\'esportazione giusta per ogni caso di utilizzo.', 'Per le esportazioni PNG, ANQR consente di specificare dimensioni esatte e include opzioni per gli sfondi trasparenti. L\'impostazione DPI ti aiuta a calcolare le dimensioni appropriate per la stampa, anche se ricorda che DPI è metadati - ciò che conta per la stampa è avere abbastanza pixel per la dimensione fisica. Quando in dubbio, esportare più grande di quanto si pensa di bisogno; scaling giù preserva la qualità mentre scaling up lo distrugge.'],
    },
    {
      heading: 'Preparare i file per Handoff',
      paragraphs: ['Quando si passa l\'opera d\'arte QR a progettisti o fornitori di stampa, includere specifiche chiare: le dimensioni fisiche previste, i requisiti minimi di zona tranquilla, e tutte le considerazioni di spazio colore. Per applicazioni critiche, fornire sia un master SVG che un backup PNG ad alta risoluzione, chiaramente etichettato con i loro usi previsti. Includi il tuo link di configurazione ANQR in modo che il codice possa essere rigenerato se necessario.', 'Anticipate errori comuni nel processo di consegna. Esplicitamente afferma che il QR non deve essere scalato, ruotato, skewed, o ha effetti applicati. Specificare che la zona tranquilla deve rimanere chiara - nessun segno di ritaglio, segni di registrazione, o elementi di progettazione intrusione. Se il QR sarà collocato su uno sfondo colorato o fotografico, fornire una versione con una forma di supporto opaco per garantire un contrasto adeguato.'],
      images: [
        {
          src: '/images/learn/print-ready-handoff.png',
          alt: 'Un diagramma del pacchetto di file che mostra il master SVG, il backup PNG, il documento delle specifiche e il collegamento di configurazione',
          caption: 'Pacchetto di consegna QR professionale: tutto ciò che un designer o fornitore di stampa ha bisogno per la riproduzione accurata',
        },
      ],
    },
    {
      heading: 'Verifica delle prove di stampa',
      paragraphs: ['Non approvare mai un\'esecuzione di stampa senza scansionare una prova fisica. Richiedi una prova stampata sul substrato reale con la finitura effettiva che verrà utilizzata in produzione. Scansiona la prova in condizioni di illuminazione simili a dove verrà visualizzato il pezzo finale. Prova con più dispositivi, compresi gli smartphone più vecchi che potrebbero lottare con la qualità marginale.', 'Se la prova esegue la scansione lentamente o inconsistente, indagare prima di approvare. I problemi comuni includono il contrasto insufficiente su substrati colorati, le violazioni zona tranquilla da rifilatura, i bordi del modulo di ammorbidimento inchiostro diffuso, o laminazione creando abbagliamento. Ognuno di questi può essere affrontato prima di impegnarsi a una piena esecuzione di stampa - ma solo se li cattura alla fase di prova.'],
      images: [
        {
          src: '/images/learn/print-ready-proof.png',
          alt: 'Una lista di controllo di prova con risultati di test di scansione, misurazioni di contrasto e firme di approvazione',
          caption: 'Flusso di lavoro di verifica della prova di stampa: test sistematici prima di impegnarsi in quantità di produzione',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: 'Aprire il generatore',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-11',
          label: 'Visualizza esempi di QR',
          type: 'example',
        },
      ],
    },

    // Guide 4: Animated QR Codes
    {
      heading: 'Creazione di codici QR animati',
      paragraphs: ['I codici QR animati combinano la funzionalità dei codici QR standard con un movimento accattivante che aumenta drasticamente i tassi di fidanzamento. In digital signage, social media e display interattivi, l\'animazione trasforma un\'utilità statica in un elemento visivo convincente che attira l\'occhio e invita l\'interazione. Questa guida copre i principi, le tecniche e i vincoli pratici della creazione di codici QR animati che scandono in modo affidabile durante la fornitura di impatto visivo.', 'La sfida fondamentale dei codici QR animati è bilanciare l\'interesse visivo contro l\'affidabilità della scansione. Ogni cornice deve essere scansionabile individualmente - uno scanner potrebbe catturare il codice in qualsiasi punto del ciclo di animazione. Questo vincolo modella ogni decisione progettuale: quali elementi possono muoversi, quanto possono cambiare, e ciò che deve rimanere stabile durante l\'animazione.'],
      images: [
        {
          src: '/images/learn/animated-overview.png',
          alt: 'Un display digital signage che mostra un codice QR animato che cattura l\'attenzione dello spettatore in uno spazio pubblico',
          caption: 'Codici QR animati in digital signage: movimento che attira l\'attenzione e incoraggia la scansione',
        },
      ],
    },
    {
      heading: 'Come l\'animazione influisce sulla scansione',
      paragraphs: ['Gli scanner QR funzionano catturando una singola cornice e analizzando il modello di moduli leggeri e scuri. Per un codice animato al lavoro, ogni cornice deve contenere il modello QR completo e valido. Questo esclude le animazioni che mormorano la struttura del codice, dissolvono i moduli, o alterano significativamente il modello di contrasto. I moduli di data-carrying - il modello apparentemente casuale nel centro - devono rimanere visivamente stabili in tutto.', 'L\'animazione sicura si avvicina a modificare elementi che non portano dati: sfondi, colori, cornici decorative e elementi sovrapposti. I componenti strutturali - modelli di ricerca (le grandi piazze d\'angolo), modelli di temporizzazione (le linee alterne), e modelli di allineamento (piccole piazze in codici più grandi) - devono mantenere le loro posizioni e proporzioni. Lavorare all\'interno di questi vincoli consente ancora animazioni sorprendentemente dinamiche e coinvolgenti.'],
    },
    {
      heading: 'Tecniche di animazione Questo lavoro',
      paragraphs: ['Il ciclismo a colori anima i colori del primo piano e dello sfondo attraverso una tavolozza mantenendo un contrasto sufficiente ad ogni passo. Questo crea un effetto vibrante e accattivante con un rischio di scansione minimo - finché il contrasto non scende mai sotto livelli leggibili. Le preset del ciclo di colore di ANQR sono progettate per mantenere la scansione durante il ciclo.', 'I sovrapposizioni animati posizionano immagini in movimento dietro un modello QR semi-trasparente. Il codice rimane stabile mentre lo sfondo anima - forse un video looping, elementi di marca animati, o grafica di movimento astratta. Questa tecnica richiede un\'attenta gestione dell\'intensità per evitare che lo sfondo travolga il modello QR, ma crea i risultati più impressionanti visivamente.'],
      images: [
        {
          src: '/images/learn/animated-layers.png',
          alt: 'Un diagramma che mostra la struttura a strati di un QR animato: strato di codice stabile su strato di sfondo animato',
          caption: 'Principio di stratificazione dell\'animazione: il modello QR rimane costante mentre gli elementi di sfondo animano sotto',
        },
      ],
    },
    {
      heading: 'Configurazione dei parametri di animazione',
      paragraphs: ['La velocità del telaio colpisce sia la scorrevolezza visiva che la dimensione del file. Per la maggior parte delle applicazioni, 10-15 fotogrammi al secondo fornisce movimento dall\'aspetto liscio senza dimensioni di file eccessive. I tassi di frame più elevati offrono una diminuzione dei ritorni visivi, aumentando significativamente le dimensioni dei file. Considera il tuo contesto di consegna - un grande segno digitale può gestire file più grandi di un posizionamento annuncio mobile.', 'Il comportamento del loop determina come i cicli di animazione. I loop senza cuciture creano un movimento continuo ideale per la segnaletica e i display ambientali. I loop Ping-pong (forward-then-reverse) funzionano bene per semplici animazioni. Per l\'attenzione-grabbing impulsi, prendere in considerazione animazioni con detiene - periodi di quiete punteggiati da movimento che attira l\'occhio senza costante fatica di movimento.'],
    },
    {
      heading: 'Creazione di sovrapposizioni animate',
      paragraphs: ['Quando si utilizzano immagini animate (GIF, WebP animati o video) come sovrapposizioni, ANQR estrae cornici e li compositi con il vostro codice QR. L\'impostazione dell\'intensità di sovrapposizione controlla la quantità dell\'animazione attraverso - i valori più bassi prescrivono la scansione mentre i valori più alti favoriscono l\'impatto visivo. Testare l\'intensità scelta su più frame per garantire una scansione coerente.', 'La qualità dei materiali di origine influisce significativamente sui risultati. Utilizzare sovrapposizioni con soggetti chiari e buon contrasto. Evitare le animazioni di sorgente con rapidi cambiamenti di luminosità o flash estremo che potrebbero creare fotogrammi a basso contrasto occasionali. Anteprima il ciclo di animazione completo prima di esportare per catturare qualsiasi frame problematico che potrebbe non eseguire la scansione.'],
      images: [
        {
          src: '/images/learn/animated-frames.png',
          alt: 'Una visione frame-by-frame di un overlay animato che mostra livelli di contrasto mantenuti in tutta la sequenza',
          caption: 'Analisi della struttura: verifica della scansione coerente in tutto il ciclo di animazione',
        },
      ],
    },
    {
      heading: 'Considerazioni di esportazione e di consegna',
      paragraphs: ['GIF rimane il formato animato più ampiamente supportato, giocando automaticamente nella maggior parte dei contesti senza richiedere il supporto del lettore video. Tuttavia, la tavolozza a 256 colori di GIF limita la fedeltà dei colori. Per le animazioni di colore-critico, prendere in considerazione WebP animato dove supportato, o rientrare in formati video per la massima qualità. L\'esportazione GIF di ANQR include opzioni di dithering per massimizzare la qualità entro i limiti della tavolozza.', 'La dimensione del file è importante per la consegna. I sistemi di segnaletica digitale, i client di posta elettronica e le piattaforme sociali spesso impongono limiti di dimensione. Se l\'animazione supera questi limiti, ridurre il numero di cornice, dimensioni o profondità di colore. A volte la divisione di un\'animazione complessa in un loop più breve raggiunge risultati migliori della compressione aggressiva che degrada ogni frame.'],
    },
    {
      heading: 'Testing Codici QR animati',
      paragraphs: ['Testare i codici animati richiede la scansione in più punti nel ciclo di animazione. Non solo scansionare una volta e assumere successo - la scansione ripetutamente, in momenti diversi, per verificare che ogni frame è leggibile. Prestare particolare attenzione ai frame a cicli di colore estremi o picchi di intensità sovrapposizione dove il contrasto potrebbe essere più basso.', 'Provare sull\'hardware di visualizzazione reale dove possibile. Monitorare la calibrazione del colore, l\'angolo di visualizzazione e l\'illuminazione ambientale influiscono tutti su come l\'animazione appare e scansiona. Un\'animazione luminosa che scandisce perfettamente sul monitor potrebbe lavarsi fuori su uno schermo esterno o diventare illeggibile ad angoli di visione obliqua.'],
      images: [
        {
          src: '/images/learn/animated-testing.png',
          alt: 'Una matrice di test che mostra i tassi di successo della scansione in diversi frame, dispositivi e condizioni di visualizzazione',
          caption: 'Protocollo di prova QR Animated: verifica sistematica su cornici, dispositivi e condizioni di visualizzazione',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: 'Aprire il generatore',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-17',
          label: 'Visualizza esempi di QR',
          type: 'example',
        },
      ],
    },

    // Guide 5: QR Safety & Compliance
    {
      heading: 'Migliori pratiche di sicurezza e conformità QR',
      paragraphs: ['Un codice QR ben progettato che non riesce a scansionare è peggio di inutile - frustra i clienti, danneggia la percezione del marchio e spreca ogni risorsa investita nella sua creazione e distribuzione. Questa guida copre i fattori tecnici e pratici che determinano se un codice QR scansiona in modo affidabile e come utilizzare le funzioni di sicurezza di ANQR per catturare i potenziali problemi prima di raggiungere la produzione.', 'L\'affidabilità del codice QR non è binaria. Un codice potrebbe scansionare perfettamente sui telefoni di punta, ma fallire sui dispositivi di bilancio. Potrebbe funzionare in illuminazione ideale, ma lotta in ristoranti dimmer o luce solare luminosa. Comprendere i fattori che influiscono sulla digitalizzazione ti aiuta a fare tradeoff informati tra stile visivo e affidabilità del mondo reale.'],
      images: [
        {
          src: '/images/learn/safety-overview.png',
          alt: 'Uno spettro di affidabilità che mostra codici QR che vanno da altamente scannable a marginalmente leggibile',
          caption: 'Lo spettro di scansione: dai codici antiproiettile allo styling che spinge i limiti di affidabilità',
        },
      ],
    },
    {
      heading: 'Capire i livelli di correzione degli errori',
      paragraphs: ['I codici QR includono ridondanza incorporata che permette loro di essere letti anche quando parzialmente danneggiato o oscurato. Il livello di correzione degli errori - L (7%), M (15%), Q (25%), o H (30%) - determina quanto del codice può mancare pur decodificando correttamente. La correzione di errore più alta crea codici più grandi, ma fornisce un margine di sicurezza per sovrapposizioni, imperfezioni di stampa e danni ambientali.', 'Per i codici con sovrapposizioni di immagine, livello di correzione di errore H è essenziale - l\'overlay oscura fisicamente parte del codice, e hai bisogno di quel 30% ridondanza per mantenere l\'affidabilità. Per codici puliti e non progettati in ambienti controllati, il livello M spesso basta. Livello L dovrebbe essere riservato a situazioni in cui la dimensione del codice è criticamente limitata e si può garantire condizioni incontaminate.'],
    },
    {
      heading: 'Zona silenziosa critica',
      paragraphs: ['La zona tranquilla è il margine vuoto che circonda ogni codice QR. Gli scanner utilizzano questo limite per identificare dove il codice inizia e termina. Lo standard ISO specifica una zona minima silenziosa di quattro moduli (quattro volte la larghezza del quadrato più piccolo nel codice). Violare questo spazio - con elementi di progettazione, bordi di trim o contenuti adiacenti - è una delle cause più comuni di errori di scansione.', 'L\'applicazione zona tranquilla di ANQR aiuta a mantenere questa spaziatura critica, ma è anche necessario assicurarsi che sia conservato nei vostri progetti finali. Durante la consegna di opere d\'arte QR, specificare esplicitamente i requisiti zona tranquilla. Quando si posizionano i codici nei layout, verificare che nessun elemento si introduca in questo spazio. Alcuni millimetri di spazio chiaro può significare la differenza tra scansione affidabile e clienti frustrati.'],
      images: [
        {
          src: '/images/learn/safety-quietzone.png',
          alt: 'Un diagramma che mostra una corretta spaziatura zona tranquilla contro violazioni comuni che causano guasti di scansione',
          caption: 'Requisiti zona tranquilla: il margine invisibile che determina il successo della scansione',
        },
      ],
    },
    {
      heading: 'Sicurezza del contrasto e del colore',
      paragraphs: ['Gli scanner QR rilevano il modello di moduli leggeri e scuri. Qualsiasi styling che riduce questo contrasto - foregrounds leggeri, sfondi scuri, effetti sfumati, o sovrapposizioni a bassa opacità - rende il codice più difficile da leggere. ANQR calcola i rapporti di contrasto e avverte quando le scelte di colore si avvicinano a livelli pericolosi, ma l\'arbitro finale è sempre un test del mondo reale.', 'La percezione del colore varia con le condizioni di illuminazione. Una combinazione di colori che appare ad alto contrasto sul monitor potrebbe diventare difficile distinguere sotto calda illuminazione a incandescenza o tubi fluorescenti freddi. Se il tuo codice verrà implementato in condizioni di illuminazione variabili, prova in sorgenti di luce multiple e considera i rapporti di contrasto più conservatori come un margine di sicurezza.'],
    },
    {
      heading: 'Dimensione del modulo e vista distanza',
      paragraphs: ['La dimensione fisica dei singoli moduli determina la distanza massima da cui è possibile scansionare un codice. I moduli più piccoli significano codici più piccoli ma richiedono distanze di scansione più vicine. La regola generale è che ogni modulo dovrebbe essere almeno 0.5mm alla distanza di scansione prevista, scalando proporzionalmente per distanze maggiori. Un codice su un cartellone ha bisogno di moduli molto più grandi di un codice su un biglietto da visita.', 'Quando si calcola la dimensione del modulo, prendere in considerazione lo scenario peggiore: il cliente con un telefono vecchio, in illuminazione imperfetta, la scansione alla distanza massima probabile. Design per questo utente, e tutti gli altri avranno un\'esperienza ancora migliore. Le raccomandazioni sulle dimensioni di ANQR in queste variabili del mondo reale per suggerire dimensioni adeguate per l\'uso previsto.'],
      images: [
        {
          src: '/images/learn/safety-distance.png',
          alt: 'Un grafico relativo dimensione del modulo, dimensioni di stampa e distanza di scansione massima efficace',
          caption: 'Guida alla distanza di scansione: dimensione del modulo corrispondente ai requisiti di implementazione',
        },
      ],
    },
    {
      heading: 'Utilizzo della modalità di sicurezza ANQR',
      paragraphs: ['La modalità di sicurezza di ANQR fornisce feedback in tempo reale sull\'affidabilità della scansione. Monitora i rapporti di contrasto, la conformità zona tranquilla, l\'intensità di sovrapposizione e altri fattori che influiscono sulla scansione. Quando un parametro si avvicina ai livelli rischiosi, vedrai avvisi con una guida specifica su come migliorare l\'affidabilità. Per le implementazioni professionali in cui il fallimento è costoso, mantenere la modalità di sicurezza attiva durante il processo di progettazione.', 'La modalità di sicurezza include anche una funzione di verifica della scansione che tenta di decodificare il codice generato e segnala il successo o il fallimento. Mentre questa verifica in-app non può replicare ogni condizione del mondo reale, cattura molti problemi comuni prima di investire nella stampa o distribuzione. Trattare la verifica di successo come una barra minima, non una garanzia - il test del mondo reale rimane essenziale.'],
    },
    {
      heading: 'Protocolli di test reali',
      paragraphs: ['Nessuna quantità di verifica software sostituisce i test fisici. Stampa il tuo codice alle dimensioni previste sul materiale rappresentativo. Provalo nell\'ambiente di distribuzione reale con condizioni di illuminazione che corrispondono all\'uso reale. Scansione con più dispositivi - non solo il telefono di punta, ma dispositivi Android di bilancio, iPhone vecchi, e qualsiasi dispositivo specifico il vostro pubblico comunemente utilizza.', 'Documenta i tuoi test sistematicamente. Registra quali dispositivi sono stati testati, in quali condizioni, con quali risultati. Se si sta implementando i codici in scala, stabilire criteri di accettazione: tasso di successo forse 95% attraverso il pool di test del dispositivo, o scansioni di successo entro 2 secondi su tutti i dispositivi testati. Questi standard aiutano a prendere decisioni go/no-go obiettivo piuttosto che sperare per il meglio.'],
      images: [
        {
          src: '/images/learn/safety-testing.png',
          alt: 'Una lista di verifica completa che copre dispositivi, condizioni e criteri di accettazione',
          caption: 'Protocollo di test di distribuzione QR: verifica sistematica prima dell\'impegno di produzione',
        },
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#safety',
          label: 'Aprire il generatore',
          type: 'generator',
        },
        {
          href: '/examples?lang=${lang}#section-0',
          label: 'Visualizza esempi di QR',
          type: 'example',
        },
      ],
    },
  ],

  relatedLinks: [
    { href: '/examples?lang=${lang}', label: 'Visualizza esempi di QR', type: 'example' },
    { href: '/guide?lang=${lang}', label: 'Aprire la guida utente completa', type: 'guide' },
    { href: '/gallery?lang=${lang}', label: 'Apri la galleria', type: 'gallery' },
  ],
};
