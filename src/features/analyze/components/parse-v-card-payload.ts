import { forEachFoldedLine } from './for-each-folded-line';
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

  const phones: string[] = [];
  const emails: string[] = [];
  const addresses: string[] = [];
  forEachFoldedLine(payload, (baseKey, keyPart, value) => {
    processVCardLine(baseKey, keyPart, value, result, phones, emails, addresses);
  });

  result.phones = phones;
  result.emails = emails;
  result.addresses = addresses;

  return result;
}
