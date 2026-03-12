import type { DataSegment } from './encoder-api.types';
import { mergeAdjacentSegments } from './merge-adjacent-segments';
import { scanAlphanumericRun } from './scan-alphanumeric-run';
import { scanByteRunEnd } from './scan-byte-run-end';
import { scanNumericRun } from './scan-numeric-run';

/**
 * Optimize a string into segments using the most efficient encoding modes.
 * This is crucial for QArt codes which use numeric fragments in URLs.
 *
 * Algorithm:
 * - Scan through the string detecting runs of numeric, alphanumeric, or byte characters
 * - Use numeric mode for runs of digits (3.33 bits/char)
 * - Use alphanumeric mode for runs of alphanumeric chars (5.5 bits/char)
 * - Use byte mode for everything else (8 bits/char)
 *
 * Minimum run lengths for mode switching (approximate thresholds):
 * - Numeric: 4+ digits to be worth switching
 * - Alphanumeric: 6+ chars to be worth switching from byte
 */
export function optimizeSegments(text: string): DataSegment[] {
  if (!text || text.length === 0) {
    return [];
  }

  const segments: DataSegment[] = [];
  const upperText = text.toUpperCase();
  let i = 0;

  while (i < text.length) {
    const numEnd = scanNumericRun(text, i);
    if (numEnd - i >= 4) {
      segments.push({ data: text.slice(i, numEnd), mode: 'numeric' });
      i = numEnd;
      continue;
    }

    const alphaEnd = scanAlphanumericRun(text, upperText, i);
    if (alphaEnd - i >= 6) {
      segments.push({ data: text.slice(i, alphaEnd), mode: 'alphanumeric' });
      i = alphaEnd;
      continue;
    }

    const byteEnd = scanByteRunEnd(text, upperText, i);
    if (byteEnd > i) {
      segments.push({ data: text.slice(i, byteEnd), mode: 'byte' });
      i = byteEnd;
    }
  }

  return mergeAdjacentSegments(segments);
}
