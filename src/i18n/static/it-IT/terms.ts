import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const terms: PageDefinition = {
  title: 'Termini di servizio',
  description: 'Accedendo o utilizzando il sito, accetti di essere vincolato da questi termini.',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/privacy?lang=${lang}', label: 'Informativa sulla privacy', type: 'external' }],
  sections: [
    {
      heading: 'Accettazione dei termini',
      paragraphs: ['Accedendo o utilizzando ANQR (anqr.link), l\'utente accetta di essere vincolato dai presenti Termini di servizio e dalla nostra Informativa sulla privacy. Se non accetti questi termini, non utilizzare il sito.', 'Possiamo aggiornare questi Termini di volta in volta. L\'uso continuato del sito dopo le modifiche costituisce l\'accettazione dei nuovi termini.'],
    },
    {
      heading: 'Ammissibilità',
      paragraphs: ['Devi avere almeno 13 anni per usare ANQR. Utilizzando il sito, si dichiara di soddisfare questo requisito di età. Se hai meno di 18 anni, rappresenti che hai il permesso del tuo genitore o tutore di utilizzare il sito.'],
    },
    {
      heading: 'Uso consentito',
      paragraphs: ['Puoi usare ANQR solo per scopi legali. Sei l\'unico responsabile del contenuto che codifica in codici QR e del modo in cui utilizzi i codici QR generati.'],
    },
    {
      heading: 'Condotta compromessa',
      paragraphs: ['Lei accetta di non:'],
      bullets: ['Utilizzare ANQR per creare codici QR che facilitano phishing, distribuzione malware, frode, truffe, molestie, diffamazione, o qualsiasi attività illegale.', 'Encode contenuti che viola i diritti di proprietà intellettuale, viola la privacy, o contiene materiale illegale.', 'Tenta di interrompere, sovraccaricare o interferire con l\'operazione o la sicurezza del sito.', 'Ingegnere inverso, decompilare, o tentare di estrarre il codice sorgente dal sito.', 'Utilizzare strumenti automatizzati (bot, raschietti) per accedere al sito in modo che degrada le prestazioni per altri utenti.', 'Circondare o disabilitare qualsiasi funzionalità di sicurezza o controllo accessi.', 'Impersonare qualsiasi persona o entità o rappresentare male la vostra affiliazione.'],
    },
    {
      heading: 'Proprietà intellettuale',
      paragraphs: ['Si mantiene la proprietà del contenuto che si codifica in codici QR. ANQR non reclama la proprietà dei suoi dati.', 'Il nome, il logo, il design dell\'interfaccia e il codice sottostante sono protetti da copyright, marchi e altre leggi sulla proprietà intellettuale. Non è possibile copiare, modificare, distribuire o creare opere derivate senza il nostro permesso.', 'QR Code® è un marchio registrato di DENSO WAVE INCORPORATED. ANQR non è affiliato a DENSO WAVE.'],
    },
    {
      heading: 'Licenza di contenuti utente',
      paragraphs: ['Utilizzando ANQR, non ci concede diritti ai tuoi contenuti. Quando si utilizza la generazione locale (il default), tutta la generazione di codici QR avviene nel browser e non si accede, memorizza o trasmette i dati codificati.', 'Quando si utilizza l\'API lato server, il contenuto viene elaborato per generare l\'immagine QR ma non viene memorizzato, registrato o utilizzato per qualsiasi altro scopo oltre a rendere l\'immagine richiesta.'],
    },
    {
      heading: 'Servizi e pubblicità di terzi',
      paragraphs: ['Il sito visualizza annunci pubblicitari tramite Google AdSense e può includere link a siti web di terze parti. Non siamo responsabili di contenuti, servizi o pratiche sulla privacy di terze parti.', 'Le tue interazioni con inserzionisti e terze parti sono esclusivamente tra te e loro. Consulta la nostra Informativa sulla privacy per informazioni sulle pratiche pubblicitarie dei dati.'],
    },
    {
      heading: 'Disclaimer di garanzie',
      paragraphs: ['ANQR È PROVVISTO DI UNA "AS IS" E DI UNA "DISPONIBILE" BASIS SENZA ARRIVI DI QUADRO, ESPRESS O IMPLIED, INCLUDENZA MA NON LIMITED ALL\'IMLIED WARRANTIES DI MERCHANTABILITÀ, FITNESS PER UN PURPOSE PARTICOLARE, E NON INFRING.', 'Non garantiamo che: (a) il sito sarà ininterrotto, sicuro o privo di errori; (b) i codici QR esegue la scansione in tutti gli ambienti, su tutti i dispositivi, o con tutte le applicazioni dello scanner; (c) il sito soddisferà le vostre esigenze.', 'È sempre necessario testare i codici QR nelle condizioni in cui saranno utilizzati (dimensione di stampa, illuminazione, tipo di schermo, distanza, qualità della fotocamera).'],
    },
    {
      heading: 'Limitazioni di responsabilità',
      paragraphs: ['UTILIZZAZIONE DEI PRODOTTI MASSIMI PERSONALI, ANQR E I SUOPERATIVI, AFFILIATI, E LICENSORI NON SONO LIBERI PER QUALI DIRETTI, INDIRETTI, INDUSTRIALI, SPECIALI, CONSEGUENTI, PUNITIVI, O ESTERNI.', 'E\' CHIARO CHE IL TUO USO DEL SERVIZIO E\' AL TUO POSTO. IL SERVIZIO E\' LIBERATO DAL CASTIGO, E, IN OGNI CASO, CONDIVIDI CHE ANQR E IOPERATIVI NON AVRANNO ALCUNA RESPONSABILITA\' PER TE, QUALUNQUE COSA ACCADA PER QUALCHE GIORNO O NOTTE. IN NO EVENTI CONDIVIDI NOSTRI TOTAL AGGREGATE LIABILITÀ ESPETTIVE ZERO DOLLARS ($0 AUD).', 'VOI VI IMPEGNATE A RIVIVERE, A VIVERE E A DISCORRERE QUALSIASI COSA E TUTTE LE QUESTIONI, LE DENUNCE E LE CAUSE DELL\'AZIONE CONTRO ANQR E GLI OPERATORI CHE SI TROVANO DALL\'USO DEL SERVIZIO.', 'ALCUNE JURISDIZIONI NON ALLOW THE EXCLUSION OF CERTAIN WARRANTIES O LIMITATIONS OF LIABILITY. IN SUCH JURISDIZIONI, LA NOSTRA LIABILITA\' SARA\' ACCOLTA AL MAXIMUM EXTENT PERMITTATO DA APPLICABILE LAW.'],
    },
    {
      heading: 'Indennità',
      paragraphs: ['L\'utente accetta di indennizzare, difendere e mantenere innocuo ANQR, i suoi operatori, affiliati, e i loro rispettivi agenti, amministratori, dipendenti e agenti da eventuali reclami, danni, perdite, passività, costi e spese (comprese le spese legali) derivanti da: (a) l\'utilizzo del sito; (b) la violazione di questi Termini; (c) la violazione di eventuali diritti di terzi; (d) qualsiasi contenuto che codifica in QR Code.'],
    },
    {
      heading: 'Risoluzione delle controversie',
      paragraphs: ['Qualsiasi controversia derivante da questi Termini o l\'utilizzo di ANQR deve essere prima tentata di essere risolta attraverso negoziati informali contattando email@anqr.link.', 'Se la risoluzione informale fallisce, le controversie saranno risolte mediante arbitrato vincolante in Victoria, Australia, tranne che o parte può chiedere sollievo ingiunto in tribunale per violazioni di proprietà intellettuale.'],
    },
    {
      heading: 'Waiver azione di classe',
      paragraphs: ['ALL\'ESTREMO PERPETUO DI LOS ANGELES, SI CONVIENE CHE QUALSIASI TIPO DI PRODOTTO DI RISOLUZIONE DISPUTA SARÀ CONDOTTO SOLO SU UN BASIS INDIVIDUALE E NON IN UNA CLASSE, CONSOLIDATO, O AZIONE RAPPRESENTATIVA.'],
    },
    {
      heading: 'Diritto di governo',
      paragraphs: ['Questi Termini sono regolati dalle leggi di Victoria, Australia, senza riguardo ai principi di conflitto di leggi. L\'utente acconsente alla giurisdizione esclusiva dei tribunali situati a Victoria, Australia.'],
    },
    {
      heading: 'Modifiche e disponibilità',
      paragraphs: ['Possiamo modificare, sospendere o interrompere il sito (o qualsiasi parte di esso) in qualsiasi momento senza preavviso o responsabilità.', 'Possiamo aggiornare questi Termini in qualsiasi momento. La data "ultimo aggiornamento" indica quando sono stati più recentemente revisionati. L\'uso continuato dopo le modifiche costituisce l\'accettazione.'],
    },
    {
      heading: 'Severabilità',
      paragraphs: ['Se una qualsiasi disposizione dei presenti Termini è ritenuta invalida o inapplicabile, tale disposizione sarà applicata nella misura massima consentita, e le restanti disposizioni resteranno in piena vigore ed efficacia.'],
    },
    {
      heading: 'Waiver',
      paragraphs: ['Il nostro mancato rispetto di qualsiasi diritto o disposizione dei presenti Termini non sarà considerato una rinuncia a tale diritto o disposizione.'],
    },
    {
      heading: 'Accordo interinale',
      paragraphs: ['I presenti Termini, insieme alla nostra Informativa sulla privacy, costituiscono l\'intero accordo tra l\'utente e ANQR relativo all\'utilizzo del sito e sostituiscono eventuali accordi precedenti.'],
    },
    {
      heading: 'Forza maggiore',
      paragraphs: ['Non saremo responsabili per eventuali fallimenti o ritardi nelle prestazioni a causa di circostanze al di là del nostro ragionevole controllo, compresi i disastri naturali, la guerra, il terrorismo, le rivolte, le azioni governative, o i fallimenti di internet/infrastruttura.'],
    },
    {
      heading: 'Contatto',
      paragraphs: ['Le domande su questi Termini possono essere inviate a: '],
    },
  ],
};

export default terms;
