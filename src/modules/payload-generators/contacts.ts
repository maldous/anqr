/**
 * Contact Payload Generators
 * vCard, MeCard, BizCard
 */

import { createLogger } from '../../lib/logger';
import type { BizCardParams, MeCardHelper, VCardHelper } from './types';
import { escapeValue, isValidEmail, isValidPhone, isValidUrl } from './utils';

const _log = createLogger('PAYLOAD');

// N: must come BEFORE FN: for better parser compatibility
// Many real-world parsers are order-dependent and ignore N if FN comes first
function appendVCardName(lines: string[], params: VCardHelper): void {
  if (params.n) {
    lines.push(`N:${escapeValue(params.n)}`);
  } else if (params.fn) {
    const parts = params.fn.split(' ');
    if (parts.length >= 2) {
      const lastName = parts.pop() || '';
      const firstName = parts.join(' ');
      lines.push(`N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
    } else {
      // Single name goes in Given Name position (2nd field), not Family Name
      // N structure: Family;Given;Additional;Prefix;Suffix
      lines.push(`N:;${escapeValue(params.fn)};;;`);
    }
  }

  if (params.fn) {
    lines.push(`FN:${escapeValue(params.fn)}`);
  }
}

function appendVCardContactInfo(lines: string[], params: VCardHelper): void {
  if (params.org) {
    lines.push(`ORG:${escapeValue(params.org)}`);
  }
  if (params.title) {
    lines.push(`TITLE:${escapeValue(params.title)}`);
  }
  if (params.role) {
    lines.push(`ROLE:${escapeValue(params.role)}`);
  }

  // Only output TEL/EMAIL if valid (Android compatibility)
  if (params.tel) {
    for (const tel of params.tel) {
      if (isValidPhone(tel)) {
        if (params.version === '4.0') {
          lines.push(`TEL;TYPE=voice:${tel}`);
        } else if (params.version === '2.1') {
          // vCard 2.1: use CELL for mobile compatibility
          lines.push(`TEL;CELL:${tel}`);
        } else {
          lines.push(`TEL:${tel}`);
        }
      }
    }
  }

  if (params.email) {
    for (const email of params.email) {
      if (isValidEmail(email)) {
        if (params.version === '4.0') {
          lines.push(`EMAIL:${email}`);
        } else if (params.version === '2.1') {
          // vCard 2.1: use INTERNET without TYPE=
          lines.push(`EMAIL;INTERNET:${email}`);
        } else {
          lines.push(`EMAIL;TYPE=INTERNET:${email}`);
        }
      }
    }
  }

  // Only output URL if it's a valid http(s):// URL (Android compatibility)
  if (params.url && isValidUrl(params.url)) {
    lines.push(`URL:${params.url}`);
  }
}

function appendVCardOptionalFields(lines: string[], params: VCardHelper): void {
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
}

/** Generate vCard string (2.1, 3.0, or 4.0) */
export function generateVCard(params: VCardHelper): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCARD', `VERSION:${params.version}`);

  appendVCardName(lines, params);
  appendVCardContactInfo(lines, params);
  appendVCardOptionalFields(lines, params);

  lines.push('END:VCARD');

  // Use CRLF line endings for Android compatibility
  // Also add trailing CRLF as required by some parsers
  return `${lines.join('\r\n')}\r\n`;
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
