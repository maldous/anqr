import { scanNumericRun } from './scan-numeric-run';
import { scanAlphanumericRun } from './scan-alphanumeric-run';

export function scanByteRunEnd(text: string, upperText: string, start: number): number {
  let i = start;
  while (i < text.length) {
    const numEnd = scanNumericRun(text, i);
    if (numEnd - i >= 4) break;
    const alphaEnd = scanAlphanumericRun(text, upperText, i);
    if (alphaEnd - i >= 6) break;
    i++;
  }
  return i;
}
