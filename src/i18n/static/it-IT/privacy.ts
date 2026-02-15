import type { PageDefinition } from '../types';

export const privacy: PageDefinition = {
  title: 'Informativa sulla privacy',
  description:
    'ANQR raccoglie, come viene utilizzato, e i tuoi diritti in base alle leggi sulla privacy applicabili.',
  lastUpdated: '1 febbraio 2026',
  relatedLinks: [{ href: '/terms?lang=${lang}', label: 'Termini di servizio', type: 'external' }],
  sections: [
    {
      heading: 'Sintesi',
      paragraphs: [
        'ANQR è un generatore di codice QR con un approccio client-first. Non abbiamo bisogno di creare un account. Per impostazione predefinita, i codici QR vengono generati localmente nel tuo browser - non abbiamo accesso al contenuto che codifica.',
        "Per uso professionale, ANQR fornisce un API lato server che genera codici QR dai parametri URL. Quando si utilizza l'API, il contenuto QR viene elaborato sui nostri server per rendere l'immagine, ma non viene memorizzato o registrato.",
        'Utilizziamo Google AdSense per la pubblicità e possiamo utilizzare servizi di analisi. Questi servizi raccolgono informazioni tramite cookie e tecnologie simili. Questa politica spiega quali dati vengono raccolti, come vengono utilizzati e i tuoi diritti.',
      ],
    },
    {
      heading: 'Informazioni che raccogliamo',
      bullets: [
        'Informazioni fornite: Se ci contattate via e-mail o il nostro modulo di contatto, raccogliamo il vostro nome, indirizzo e-mail e contenuto di messaggi.',
        'Informazioni raccolte automaticamente: Il nostro provider di hosting (Netlify), partner pubblicitari e servizi di analisi possono raccogliere: indirizzo IP, tipo di browser e versione, sistema operativo, tipo di dispositivo, URL di riferimento, pagine visitate, tempo sul sito e posizione geografica approssimativa.',
        'Cookie di terze parti: I nostri partner pubblicitari (Google AdSense) utilizzano cookie e tecnologie simili per servire e misurare pubblicità. ANQR stesso non imposta alcun cookie di prima parte.',
      ],
    },
    {
      heading: 'Cookie e tecnologie di terze parti',
      paragraphs: [
        'ANQR non imposta cookie di prima parte. Le tue preferenze (come la modalità oscura) vengono memorizzate localmente sul tuo dispositivo, che non viene trasmesso a nessun server.',
        'Tuttavia, i nostri partner pubblicitari (Google AdSense) e hosting provider possono utilizzare cookie e tecnologie di tracciamento simili:',
      ],
      bullets: [
        'Cookie pubblicitari (terze parti): Impostato da Google AdSense e partner pubblicitari per servire annunci pertinenti, misurare le prestazioni degli annunci e comprendere gli interessi degli utenti. Questi cookie possono monitorare la tua attività su diversi siti web.',
        'Cookie di analisi (terze parti): Può essere utilizzato dal nostro provider di hosting o servizi di analisi per raccogliere dati di utilizzo anonimi.',
      ],
    },
    {
      heading: 'Google AdSense e pubblicità',
      paragraphs: [
        'Mostriamo pubblicità tramite Google AdSense. Google e i suoi partner utilizzano i cookie per servire gli annunci basati sulla cronologia di navigazione su questo sito e su altri siti web (pubblicità basata sugli interessi).',
        'Scopri come Google utilizza le tue informazioni: https://policies.google.com/technologies/partner-sites',
        'Gestione della personalizzazione degli annunci: https://adssettings.google.com',
        'Opt out via Network Advertising Initiative: https://optout.networkadvertising.org',
        'Opt out via Digital Advertising Alliance: https://optout.aboutads.info',
      ],
    },
    {
      heading: 'Come utilizziamo le informazioni',
      bullets: [
        'Per rispondere alle vostre richieste e fornire supporto.',
        'Per visualizzare pubblicità pertinenti attraverso i nostri partner pubblicitari.',
        "Per analizzare l'utilizzo del sito e migliorare i nostri servizi.",
        'Per rilevare, prevenire e affrontare frodi, abusi e problemi di sicurezza.',
        'Per adempiere agli obblighi legali.',
      ],
    },
    {
      heading: 'Servizi di terze parti',
      bullets: [
        'Google AdSense: riceve i dati per servire e misurare pubblicità.',
        'Provider di analisi: Ricevi dati di utilizzo anonimi.',
        'Netlify (hosting): Elabora richieste e può registrare indirizzi IP.',
        'Non vendiamo le vostre informazioni personali. Tuttavia, la condivisione dei dati con partner pubblicitari può essere considerata una "vendita" sotto CCPA (vedi sotto).',
      ],
    },
    {
      heading: 'Ritenzione dei dati',
      bullets: [
        'Contatti: Fino a 2 anni.',
        'Log del server: Fino a 30 giorni (fornitore ospite).',
        'Dati di analisi: Fino a 26 mesi (anonimato).',
        'Cookie pubblicitari: Tipicamente 13 mesi (varie per partner).',
      ],
    },
    {
      heading: 'I tuoi diritti ai sensi del GDPR (utilizzatori SEE)',
      paragraphs: [
        'Se sei nello Spazio Economico Europeo, hai i seguenti diritti ai sensi del Regolamento Generale sulla Protezione dei Dati:',
      ],
      bullets: [
        'Diritto di accesso: Richiedi una copia dei dati personali che teniamo.',
        'Diritto di rettifica: Richiedi la correzione dei dati imprecisi.',
        'Diritto di cancellazione: Richiedi la cancellazione dei tuoi dati ("diritto da dimenticare").',
        'Diritto di limitazione del trattamento: Richiedi limiti su come utilizziamo i tuoi dati.',
        'Diritto alla portabilità dei dati: Richiedi i tuoi dati in formato portatile.',
        'Diritto di opposizione: Oggetto al trattamento, anche per il marketing diretto.',
        'Diritto di revoca del consenso: Prelevare il consenso in qualsiasi momento in cui il trattamento è basato sul consenso.',
        'Diritto di presentare reclamo: Compilare un reclamo con la vostra autorità di protezione dei dati.',
      ],
    },
    {
      heading: 'Base giuridica GDPR',
      paragraphs: [
        'Trattiamo i dati su queste basi: (a) Consenso - per pubblicità personalizzata (gestita dai nostri partner pubblicitari); (b) Interessi legittimi - per analisi, sicurezza e miglioramento; (c) Contratto - per rispondere alle richieste.',
        'Per esercitare i tuoi diritti, contatta . Rispondiamo entro 30 giorni.',
      ],
    },
    {
      heading: 'I tuoi diritti sotto CCPA (utenti di California)',
      bullets: [
        'Diritto di sapere: Richiedi informazioni sui dati raccolti, fonti, finalità e terze parti.',
        'Diritto di cancellazione: Richiedi la cancellazione dei tuoi dati personali.',
        'Diritto di opt-out: Optare fuori dalla "vendita" di informazioni personali (condivisione con partner pubblicitari può qualificarsi).',
        "Diritto alla non discriminazione: Non discriminare l'esercizio dei suoi diritti.",
      ],
    },
    {
      heading: 'Categorie CCPA raccolte',
      paragraphs: [
        'Categorie: Identifiers (indirizzo IP, ID dispositivo), Attività Internet (browsing, interazioni ad), Geolocalizzazione (approssimativo), Inferenze (interessi dalla navigazione).',
        'Per esercitare diritti o disattivare:  o regolare le impostazioni dei cookie.',
      ],
    },
    {
      heading: 'Trasferimenti internazionali',
      paragraphs: [
        'Le tue informazioni possono essere trasferite in paesi con diverse leggi sulla protezione dei dati, compresi gli Stati Uniti. Utilizziamo garanzie appropriate come le clausole contrattuali standard.',
      ],
    },
    {
      heading: 'Privacy dei bambini',
      paragraphs: [
        'ANQR non è diretto a bambini sotto i 13 anni (o 16 nel SEE). Non raccogliamo consapevolmente dati da bambini. Contatta  se credi che un bambino abbia fornito informazioni.',
      ],
    },
    {
      heading: 'Sicurezza',
      paragraphs: [
        'Utilizziamo misure tecniche e organizzative appropriate per proteggere i dati, inclusa la crittografia HTTPS. Tuttavia, nessuna trasmissione internet è sicuro al 100%.',
      ],
    },
    {
      heading: 'Non rintracciare',
      paragraphs: [
        'Onoriamo Non Tracciare segnali del browser dove possibile, anche se i partner pubblicitari non possono rispondere a DNT.',
      ],
    },
    {
      heading: 'Modifiche a questa politica',
      paragraphs: [
        'Possiamo aggiornare periodicamente questa politica. La data "ultimo aggiornamento" indica la revisione più recente. Le modifiche significative possono essere comunicate tramite un banner del sito.',
      ],
    },
    {
      heading: 'Contattaci',
      paragraphs: [
        'Per domande sulla privacy o per esercitare i tuoi diritti:  o utilizzare la nostra pagina di contatto. Rispondiamo alle richieste di privacy entro 30 giorni.',
      ],
    },
    {
      heading: 'Informativa sulla privacy completa',
      paragraphs: [
        'Questa pagina fornisce un riepilogo delle nostre pratiche sulla privacy. Per la politica sulla privacy completa e legalmente vincolante con tutti i dettagli sul trattamento dei dati, i tuoi diritti e i nostri obblighi ai sensi del GDPR, del CCPA e di altre leggi sulla privacy, consulta la nostra politica completa ospitata da iubenda.',
      ],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: 'Visualizza la Privacy Policy completa su iubenda',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
