import type { DataSegment } from './encoder-api.types';

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
