import type { DataSegment } from './encoder-api.types';
import type { EncodingMode } from './encoder-api.types';
import { getCompatibleMode } from './get-compatible-mode';
/**
 * Check if a character is numeric (0-9)
 */
function isNumeric(char: string): boolean {
  return /^\d$/.test(char);
}

/**
 * Check if a character is alphanumeric (0-9, A-Z, space, $%*+-./:)
 */
function isAlphanumeric(char: string): boolean {
  return /^[0-9A-Z $%*+\-./:]$/.test(char);
}

export function scanNumericRun(text: string, start: number): number {
  let i = start;
  while (i < text.length && isNumeric(text[i])) i++;
  return i;
}

export function scanAlphanumericRun(text: string, upperText: string, start: number): number {
  let i = start;
  while (i < text.length && isAlphanumeric(upperText[i]) && text[i] === upperText[i]) i++;
  return i;
}

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

export function mergeAdjacentSegments(segments: DataSegment[]): DataSegment[] {
  const merged: DataSegment[] = [];
  for (const seg of segments) {
    if (merged.length > 0 && merged[merged.length - 1].mode === seg.mode) {
      merged[merged.length - 1].data += seg.data;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

export function calculateModeDataBits(mode: DataSegment['mode'], dataLength: number): number {
  switch (mode) {
    case 'numeric':
      // 10 bits per 3 digits, 7 bits for 2 remaining, 4 bits for 1 remaining
      return (
        Math.floor(dataLength / 3) * 10 + (dataLength % 3 === 2 ? 7 : dataLength % 3 === 1 ? 4 : 0)
      );
    case 'alphanumeric':
      // 11 bits per 2 chars, 6 bits for 1 remaining
      return Math.floor(dataLength / 2) * 11 + (dataLength % 2 === 1 ? 6 : 0);
    case 'byte':
      return dataLength * 8;
    case 'kanji':
      return dataLength * 13;
  }
}

export function toEncoderModeToken(
  mode: EncodingMode | 'numeric' | 'alphanumeric' | 'byte' | 'kanji',
  content: string
): string | undefined {
  // For explicit segment modes, use directly
  if (mode === 'numeric') return 'Numeric';
  if (mode === 'alphanumeric') return 'Alphanumeric';
  if (mode === 'kanji') return 'Kanji';
  if (mode === 'byte') return 'Byte';

  const compatible = getCompatibleMode(content, mode);
  switch (compatible) {
    case 'numeric':
      return 'Numeric';
    case 'alphanumeric':
      return 'Alphanumeric';
    case 'kanji':
      return 'Kanji';
    default:
      return 'Byte';
  }
}

export { isNumeric, isAlphanumeric };
