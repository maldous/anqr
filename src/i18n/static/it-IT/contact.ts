import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Contattaci',
  description: 'Diamo il benvenuto a feedback, segnalazioni di bug, richieste di funzionalità e richieste generali.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Come raggiungerci',
      paragraphs: ['Offriamo diversi modi per contattarci in base alle vostre esigenze. Leggiamo ogni messaggio, anche se i tempi di risposta possono variare in base al tipo di volume e richiesta.'],
    },
    {
      heading: 'Email',
      paragraphs: ['Per tutte le richieste: Traduzione:', 'Questo è il modo più affidabile per raggiungerci ed è consigliato per domande dettagliate, richieste di lavoro, o qualsiasi altra richiesta.'],
    },
    {
      heading: 'Tipi di richieste',
      bullets: ['Questioni generali: Domande su come utilizzare ANQR, spiegazioni delle caratteristiche o feedback generale.', 'Rapporti di bug: Si prega di includere il browser, il sistema operativo, i passaggi per riprodurre e tutti i messaggi di errore che si vedono.', 'Richieste di funzionalità: Suggerimenti per nuove funzionalità o miglioramenti. Consideriamo tutte le richieste anche se non possiamo promettere l\'implementazione.', 'Richieste aziendali: Opportunità di partenariato, domande di licenza o richieste di uso commerciale.', 'Richieste di privacy: Richieste di esercitare i tuoi diritti di privacy ai sensi del GDPR, CCPA o altre leggi sulla privacy (vedere Informativa sulla privacy).', 'DMCA/Copyright: Vedere la sezione DMCA qui sotto per i requisiti di preavviso di rimozione.'],
    },
    {
      heading: 'Tempi di risposta',
      paragraphs: ['Vogliamo rispondere alle richieste entro 5-7 giorni lavorativi. Le richieste relative alla privacy saranno affrontate entro 30 giorni dalla legge.', 'Durante i periodi occupati, i tempi di risposta possono essere più lunghi. Per questioni urgenti, si prega di indicare "URGENT" nella vostra linea di soggetto.'],
    },
    {
      heading: 'Prima di contattarci',
      paragraphs: ['Si prega di controllare la nostra pagina Documentazione per le risposte alle domande comuni su come utilizzare le funzioni ANQR. Molte domande sulla generazione del codice QR, lo styling e le opzioni di esportazione sono coperte lì.'],
    },
    {
      heading: 'DM Avviso di copyright',
      paragraphs: ['Se si ritiene che i contenuti disponibili su ANQR violi il copyright, è possibile inviare un avviso di rimozione Digital Millennium Copyright Act (DMCA). Per essere valido, il tuo avviso deve includere:'],
      bullets: ['Una firma fisica o elettronica del proprietario del copyright o agente autorizzato.', 'Identificazione dell\'opera d\'autore dichiarata violata.', 'Identificazione del materiale che si ritiene essere in violazione, con informazioni sufficienti per individuarlo.', 'Le informazioni di contatto (indirizzo, numero di telefono e indirizzo email).', 'Una dichiarazione che avete una buona fede che l\'uso del materiale non è autorizzato dal proprietario del copyright.', 'Una dichiarazione, a pena di falsa testimonianza, che le informazioni contenute nella vostra comunicazione sono accurate e che siete il proprietario del copyright o autorizzati ad agire per loro conto.'],
    },
    {
      heading: 'DMCA Contatto',
      paragraphs: ['Invia comunicazioni DMCA a: ', 'Si prega di includere "avviso DMCA" nella riga dell\'oggetto. Risponderemo a comunicazioni valide secondo la legge applicabile. Si noti che ANQR genera codici QR localmente sui dispositivi degli utenti e non ospita contenuti generati dagli utenti.'],
    },
    {
      heading: 'Comunità di Reddit',
      paragraphs: ['Unisciti alla nostra community Reddit su r/ANQR per condividere le tue creazioni QR, porre domande, ottenere aiuto e connetterti con altri utenti ANQR.'],
    },
  ],
};

export default contact;
