import { isValidPhone } from '../../modules/payload-generators/utils';
import { formatTelLine } from './format-tel-line';

export function appendValidTelLines(lines: string[], tels: string[], version: string): void {
  for (const tel of tels) {
    if (isValidPhone(tel)) {
      lines.push(formatTelLine(tel, version));
    }
  }
}
