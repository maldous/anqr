import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const translate: PageDefinition = {
  title: 'Aiutaci a tradurre ANQR',
  description: 'Unisciti alla nostra community di traduttori che contribuiscono a rendere ANQR accessibile agli utenti di tutto il mondo. Non è richiesta alcuna esperienza di codifica: contribuisci direttamente dal tuo browser.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: 'Apri l\'archivio delle traduzioni', type: 'external' },
    { href: '/?lang=${lang}', label: 'Apri il generatore', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: 'Informazioni sull\'ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: 'Contattaci', type: 'external' },
  ],
  sections: [
    {
      heading: 'Perchè Contribuire?',
      paragraphs: ['ANQR viene utilizzato da persone di tutto il mondo per creare codici QR per aziende, eventi, pagamenti e progetti personali. Contribuendo alle traduzioni, contribuisci a rendere questo potente strumento accessibile agli utenti che preferiscono la loro lingua madre.', 'Ogni contributo di traduzione, sia che si tratti di correggere un errore di battitura o di tradurre un\'intera lingua, fa davvero la differenza per gli utenti della tua comunità.'],
    },
    {
      heading: 'Cosa puoi tradurre?',
      paragraphs: ['ANQR ha due tipi di contenuti traducibili:'],
      bullets: ['Stringhe dell\'interfaccia utente: etichette dei pulsanti, voci di menu, descrizioni comandi e testo dell\'interfaccia visualizzati in tutta l\'app.', 'Contenuto statico: pagine di documentazione che includono guide, esempi, politica sulla privacy e articoli della guida.', 'Entrambi i tipi vengono memorizzati come semplici file di testo che puoi modificare direttamente nel tuo browser, senza bisogno di software speciale.', 'Le traduzioni vengono riviste prima di essere unificate per garantire qualità e coerenza.'],
    },
    {
      heading: 'Come contribuire',
      paragraphs: ['Contribuire è semplice e non richiede alcuna conoscenza di Git:'],
      bullets: ['Visita il nostro repository di traduzioni pubbliche su GitHub.', 'Trova il file della tua lingua (o creane uno nuovo se la tua lingua non è ancora supportata).', 'Fai clic sull\'icona della matita per modificare direttamente nel tuo browser.', 'Apporta le modifiche e fai clic su "Proponi modifiche": GitHub creerà automaticamente una richiesta pull.', 'Il tuo contributo verrà rivisto e unito, in genere entro pochi giorni.'],
    },
    {
      heading: 'Linee guida per la traduzione',
      paragraphs: ['Durante la traduzione, mantieni invariati i segnaposto come {name}, {count} e {{variable}}: questi vengono sostituiti con valori dinamici in fase di esecuzione. Conserva anche qualsiasi sintassi simile a HTML come i collegamenti nel formato [[/path|Label]].', 'Se non sei sicuro di una traduzione, è meglio lasciarla in inglese piuttosto che fornire una traduzione errata. Puoi anche aprire un issue su GitHub per chiedere chiarimenti.'],
    },
    {
      heading: 'Lingue attualmente supportate',
      paragraphs: ['ANQR attualmente supporta oltre 40 lingue, tra cui:'],
      bullets: ['Principali lingue del mondo: inglese, cinese, spagnolo, arabo, hindi, portoghese, giapponese, coreano, francese, tedesco, russo e altre.', 'Lingue del sud-est asiatico: tailandese, vietnamita, indonesiano, filippino, malese, khmer, laotiano, birmano.', 'Lingue dell\'Asia meridionale: hindi, tamil, telugu, bengalese, marathi, gujarati, kannada, malayalam, punjabi, nepalese.'],
    },
    {
      heading: 'Riconoscimento',
      paragraphs: ['Tutti i contributori sono accreditati nel nostro repository. Il tuo lavoro aiuta migliaia di utenti ad accedere all\'ANQR nella loro lingua preferita.', 'Grazie a tutti i nostri collaboratori di traduzione per aver contribuito a rendere ANQR accessibile in tutto il mondo!'],
    },
    {
      heading: 'Domande?',
      paragraphs: ['Se hai domande sul contributo alle traduzioni, apri un problema sul nostro repository GitHub o contattaci via email. Siamo felici di aiutarti a iniziare.'],
    },
  ],
};

export default translate;
