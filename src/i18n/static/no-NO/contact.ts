import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const contact: PageDefinition = {
  title: 'Kontakt oss',
  description: 'Vi ønsker gjerne tilbakemeldinger, feilrapporter, funksjonsforespørsler og generelle forespørsler.',
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      heading: 'Hvordan nå oss',
      paragraphs: ['Vi tilbyr flere måter å kontakte oss på avhengig av dine behov. Vi leser hver melding, men responstider kan variere basert på volum og forespørselstype.'],
    },
    {
      heading: 'E-post',
      paragraphs: ['For alle henvendelser: email@anqr.link', 'Dette er den mest pålitelige måten å nå oss på og anbefales for detaljerte spørsmål, forretningshenvendelser eller andre forespørsler.'],
    },
    {
      heading: 'Typer av henvendelser',
      bullets: ['Generelle spørsmål: Spørsmål om hvordan du bruker ANQR, funksjonsforklaringer eller generell tilbakemelding.', 'Feilrapporter: Ta med nettleseren din, operativsystemet, fremgangsmåten for å reprodusere og eventuelle feilmeldinger du ser.', 'Funksjonsforespørsler: Forslag til nye funksjoner eller forbedringer. Vi vurderer alle ønsker selv om vi ikke kan love implementering.', 'Forretningsforespørsler: Partnerskapsmuligheter, lisensieringsspørsmål eller forespørsler om kommersiell bruk.', 'Personvernforespørsler: Forespørsler om å utøve dine personvernrettigheter under GDPR, CCPA eller andre personvernlover (se Personvernerklæring).', 'DMCA/Copyright: Se DMCA-delen nedenfor for varsel om fjerning.'],
    },
    {
      heading: 'Svarstider',
      paragraphs: ['Vi ønsker å svare på henvendelser innen 5-7 virkedager. Personvernrelaterte forespørsler vil bli adressert innen 30 dager som kreves av loven.', 'I travle perioder kan responstiden være lengre. For hastesaker, vennligst angi "URGENT" i emnelinjen din.'],
    },
    {
      heading: 'Før du kontakter oss',
      paragraphs: ['Vennligst sjekk vår dokumentasjonsside for svar på vanlige spørsmål om hvordan du bruker ANQR-funksjoner. Mange spørsmål om QR-kodegenerering, styling og eksportalternativer er dekket der.'],
    },
    {
      heading: 'DMCA Kundeområde',
      paragraphs: ['Hvis du mener at innhold som er tilgjengelig på ANQR krenker opphavsretten din, kan du sende en Digital Millennium Copyright Act (DMCA) takedown-erklæring. For å være gyldig, må varselet inkludere:'],
      bullets: ['En fysisk eller elektronisk signatur av opphavsrettseieren eller autorisert agent.', 'Identifikasjon av opphavsrettslig arbeid hevdet å ha blitt krenket.', 'Identifikasjon av materialet som hevdes å være infisert, med informasjon som er tilstrekkelig til å lokalisere det.', 'Din kontaktinformasjon (adresse, telefonnummer og e-postadresse).', 'En uttalelse om at du har god tro på at bruk av materialet ikke er autorisert av opphavsrettseieren.', 'En erklæring under straff av skade, om at informasjonen i din melding er nøyaktig og at du er opphavsrettseieren eller autorisert til å handle på deres vegne.'],
    },
    {
      heading: 'DMCA Kontakt',
      paragraphs: ['Send DMCA-meldinger til: email@anqr.link', 'Vennligst inkluder "DMCA Notice" i emnelinjen. Vi vil svare på gyldige varsler i samsvar med gjeldende lov. Merk at ANQR genererer QR-koder lokalt på brukernes enheter og ikke er vert for brukergenerert innhold.'],
    },
    {
      heading: 'Reddit-fellesskap',
      paragraphs: ['Bli med i Reddit-fellesskapet vårt på r/ANQR for å dele QR-kreasjonene dine, stille spørsmål, få hjelp og få kontakt med andre ANQR-brukere.'],
    },
  ],
};

export default contact;
