import { getBCHTypeInfo } from '../encode/utils';
import type { ECCLevel } from './bit-mapping';
import { eccToNumericForEncoder } from './ecc-to-numeric-for-encoder';

export function writeFormatInfo(
  modules: (boolean | null)[][],
  ecc: ECCLevel,
  maskPattern: number,
  moduleCount: number
): void {
  const eccLevel = eccToNumericForEncoder(ecc);
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1;

    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[moduleCount - 15 + i][8] = mod;
    }

    if (i < 8) {
      modules[8][moduleCount - i - 1] = mod;
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod;
    } else {
      modules[8][15 - i - 1] = mod;
    }
  }

  modules[moduleCount - 8][8] = true;
}
