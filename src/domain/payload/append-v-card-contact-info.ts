import type { VCardHelper } from '../../modules/payload-generators/types';
import { escapeValue, isValidUrl } from '../../modules/payload-generators/utils';
import { appendValidTelLines } from './append-valid-tel-lines';
import { appendValidEmailLines } from './append-valid-email-lines';

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
