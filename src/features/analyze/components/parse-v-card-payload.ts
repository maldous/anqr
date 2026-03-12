import { processVCardLine } from './process-v-card-line';

export function parseVCardPayload(payload: string): Record<string, string | string[] | null> {
  const result: Record<string, string | string[] | null> = {
    version: null,
    fullName: null,
    name: null,
    organization: null,
    title: null,
    phones: [],
    emails: [],
    addresses: [],
    birthday: null,
    url: null,
    note: null,
    hasPhoto: null,
  };

  if (!payload.toUpperCase().includes('BEGIN:VCARD')) return result;

  const lines = payload.split(/\r?\n/);
  const phones: string[] = [];
  const emails: string[] = [];
  const addresses: string[] = [];

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      i++;
      line += lines[i].slice(1);
    }
    i++;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = keyPart.split(';')[0];

    processVCardLine(baseKey, keyPart, value, result, phones, emails, addresses);
  }

  result.phones = phones;
  result.emails = emails;
  result.addresses = addresses;

  return result;
}
