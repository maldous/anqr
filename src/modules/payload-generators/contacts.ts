/**
 * Contact Payload Generators
 * vCard, MeCard, BizCard
 */

import type { BizCardParams, MeCardHelper, VCardHelper } from './types';
import { escapeValue } from './utils';

/** Generate vCard string (2.1, 3.0, or 4.0) */
export function generateVCard(params: VCardHelper): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCARD', `VERSION:${params.version}`);

  if (params.fn) {
    lines.push(`FN:${escapeValue(params.fn)}`);
  }

  if (params.n) {
    lines.push(`N:${escapeValue(params.n)}`);
  } else if (params.fn) {
    const parts = params.fn.split(' ');
    if (parts.length >= 2) {
      const lastName = parts.pop() || '';
      const firstName = parts.join(' ');
      lines.push(`N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
    } else {
      lines.push(`N:${escapeValue(params.fn)};;;;`);
    }
  }

  if (params.org) {
    lines.push(`ORG:${escapeValue(params.org)}`);
  }

  if (params.title) {
    lines.push(`TITLE:${escapeValue(params.title)}`);
  }

  if (params.role) {
    lines.push(`ROLE:${escapeValue(params.role)}`);
  }

  if (params.tel) {
    for (const tel of params.tel) {
      if (params.version === '4.0') {
        lines.push(`TEL;TYPE=voice:${tel}`);
      } else {
        lines.push(`TEL:${tel}`);
      }
    }
  }

  if (params.email) {
    for (const email of params.email) {
      if (params.version === '4.0') {
        lines.push(`EMAIL:${email}`);
      } else {
        lines.push(`EMAIL;TYPE=INTERNET:${email}`);
      }
    }
  }

  if (params.url) {
    lines.push(`URL:${params.url}`);
  }

  if (params.adr) {
    for (const adr of params.adr) {
      lines.push(`ADR:${escapeValue(adr)}`);
    }
  }

  if (params.bday) {
    lines.push(`BDAY:${params.bday}`);
  }

  if (params.photo) {
    if (params.version === '4.0') {
      lines.push(`PHOTO:${params.photo}`);
    } else {
      lines.push(`PHOTO;VALUE=URI:${params.photo}`);
    }
  }

  if (params.note) {
    lines.push(`NOTE:${escapeValue(params.note)}`);
  }

  if (params.impp) {
    lines.push(`IMPP:${params.impp}`);
  }

  if (params.uid) {
    lines.push(`UID:${params.uid}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

/** Generate MeCard string (Japanese format, more compact than vCard) */
export function generateMeCard(params: MeCardHelper): string {
  const escapeMeCard = (s: string) => s.replaceAll(/[\\";,:]/g, String.raw`\$&`);

  let mecard = 'MECARD:';

  if (params.n) mecard += `N:${escapeMeCard(params.n)};`;
  if (params.nickname) mecard += `NICKNAME:${escapeMeCard(params.nickname)};`;
  if (params.org) mecard += `ORG:${escapeMeCard(params.org)};`;
  if (params.tel) mecard += `TEL:${params.tel};`;
  if (params.email) mecard += `EMAIL:${params.email};`;
  if (params.url) mecard += `URL:${params.url};`;
  if (params.adr) mecard += `ADR:${escapeMeCard(params.adr)};`;
  if (params.bday) mecard += `BDAY:${params.bday.replaceAll('-', '')};`;
  if (params.note) mecard += `NOTE:${escapeMeCard(params.note)};`;

  mecard += ';';
  return mecard;
}

/** Generate BizCard format (older format, simple) */
export function generateBizCard(params: BizCardParams): string {
  const lines: string[] = ['BIZCARD:'];

  const fields: string[] = [];
  if (params.firstName) fields.push(`N:${params.firstName}`);
  if (params.lastName) fields.push(`X:${params.lastName}`);
  if (params.title) fields.push(`T:${params.title}`);
  if (params.company) fields.push(`C:${params.company}`);
  if (params.phone) fields.push(`B:${params.phone}`);
  if (params.email) fields.push(`E:${params.email}`);
  if (params.address) fields.push(`A:${params.address}`);

  lines.push(...fields, ';');
  return lines.join(';');
}
