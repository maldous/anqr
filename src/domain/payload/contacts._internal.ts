import type { VCardHelper } from '../../modules/payload-generators/types';
import {
  escapeValue,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from '../../modules/payload-generators/utils';

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

export function formatTelLine(tel: string, version: string): string {
  if (version === '4.0') {
    return `TEL;TYPE=voice:${tel}`;
  } else if (version === '2.1') {
    // vCard 2.1: use CELL for mobile compatibility
    return `TEL;CELL:${tel}`;
  } else {
    return `TEL:${tel}`;
  }
}

export function formatEmailLine(email: string, version: string): string {
  if (version === '4.0') {
    return `EMAIL:${email}`;
  } else if (version === '2.1') {
    // vCard 2.1: use INTERNET without TYPE=
    return `EMAIL;INTERNET:${email}`;
  } else {
    return `EMAIL;TYPE=INTERNET:${email}`;
  }
}

export function appendValidTelLines(lines: string[], tels: string[], version: string): void {
  for (const tel of tels) {
    if (isValidPhone(tel)) {
      lines.push(formatTelLine(tel, version));
    }
  }
}

export function appendValidEmailLines(lines: string[], emails: string[], version: string): void {
  for (const email of emails) {
    if (isValidEmail(email)) {
      lines.push(formatEmailLine(email, version));
    }
  }
}

export function appendVCardContactInfo(lines: string[], params: VCardHelper): void {
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
    appendValidTelLines(lines, params.tel, params.version);
  }
  if (params.email) {
    appendValidEmailLines(lines, params.email, params.version);
  }

  if (params.url && isValidUrl(params.url)) {
    lines.push(`URL:${params.url}`);
  }
}

export function appendVCardOptionalFields(lines: string[], params: VCardHelper): void {
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

export { appendVCardName };
