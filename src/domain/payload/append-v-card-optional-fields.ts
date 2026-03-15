import type { VCardHelper } from '../../modules/payload-generators/types';
import { escapeValue } from '../../modules/payload-generators/utils';

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
