import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'Informazioni su ANQR',
  description: 'ANQR è un generatore di codice QR gratuito con un approccio client-first - generare codici QR localmente o utilizzare la nostra API per incorporare.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Aprire il generatore', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Sfoglia gli articoli', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Informativa sulla privacy', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Termini di servizio', type: 'external' },
  ],
  sections: [
    {
      heading: 'Cos\'è ANQR?',
      paragraphs: ['ANQR (pronunciato "anchor") è un generatore di codice QR gratuito che crea codici scanner per URL, testo, credenziali Wi-Fi, schede di contatto, eventi di calendario e altro ancora.', 'È costruito per individui, piccole imprese, marketers e sviluppatori che vogliono potenti strumenti QR senza sottoscrivere. Il primo design client significa che i codici QR vengono generati localmente nel tuo browser per impostazione predefinita, con un\'API server opzionale per l\'integrazione e l\'integrazione professionale.'],
    },
    {
      heading: 'Caratteristiche chiave',
      bullets: ['Genera codici QR istantaneamente nel tuo browser: non è richiesto alcun account.', 'Personalizzare colori, stili di modulo, modelli di ricerca e aggiungere sovrapposizioni di immagine.', 'Esporta in formati multipli: PNG, SVG, WebP e GIF animati.', 'Controlli avanzati per il livello di correzione degli errori, versione QR, modalità di codifica e selezione delle maschere.', 'Guida alla sicurezza di scansione e anteprima live per aiutare a mantenere i codici leggibili in stampa e sugli schermi.', 'API lato server per l\'integrazione professionale con il supporto completo dei parametri.', 'Funziona offline una volta caricato - è un web app statico è possibile eseguire ovunque.'],
    },
    {
      heading: 'Come funziona ANQR',
      paragraphs: ['ANQR funziona nel tuo browser e codifica il tuo input in una matrice QR standard con correzione di errore Reed-Solomon, quindi lo rende al formato che scegli.', 'Per impostazione predefinita, la generazione avviene localmente nel tuo browser. Per uso professionale, è anche possibile utilizzare l\'API lato server per generare codici QR tramite parametri URL - perfetto per l\'integrazione in siti web, e-mail o flussi di lavoro automatizzati.', 'Quando si aggiungono sovrapposizioni o animazioni, ANQR bilancia lo stile con l\'affidabilità della scansione in modo che il risultato rimanga scansionabile.', 'ANQR si concentra sui codici statici (i dati sono all\'interno del QR). Se hai bisogno di un codice dinamico (destina modificabile), puoi codificare il tuo URL redirect o il link breve.'],
    },
    {
      heading: 'Chi gestisce ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Pubblicità e come rimaniamo liberi',
      paragraphs: ['ANQR è libero da usare ed è supportato dalla pubblicità. Possiamo mostrare annunci tramite Google AdSense e/o altri partner pubblicitari.', 'I fornitori di annunci possono utilizzare cookie o tecnologie simili per personalizzare gli annunci in base ai vostri interessi e attività di navigazione. È possibile gestire le preferenze degli annunci nelle impostazioni del dispositivo e attraverso le impostazioni di Google e saperne di più nella nostra Informativa sulla privacy.', 'Non vendiamo i contenuti che codificate nei codici QR. Gli annunci aiutano a coprire il costo di eseguire e migliorare il progetto.'],
    },
    {
      heading: 'Standard aperti',
      paragraphs: ['ANQR genera codici QR in base allo standard ISO/IEC 18004 e mira ad una vasta compatibilità tra scanner, telecamere e flussi di lavoro di stampa.'],
    },
    {
      heading: 'Avviso di marchio',
      paragraphs: ['QR Code® è un marchio registrato di DENSO WAVE INCORPORATED. ANQR non è affiliato, approvato da, o sponsorizzato da DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Feedback e contributi',
      paragraphs: ['Diamo il benvenuto a feedback, segnalazioni di bug e suggerimenti di funzionalità. Si prega di mettersi in contatto via e-mail o la pagina di contatto - leggiamo ogni messaggio, anche se i tempi di risposta possono variare.'],
    },
  ],
};

export default about;
