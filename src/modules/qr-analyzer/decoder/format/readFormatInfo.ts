import {DecodedFormatInfo, FormatInfo, agree, best, bits, decoded1, decoded2, dist, eccLevel, maskPattern, matrix, result, x} from '../shared';
import { readFormatInfoDetailed } from '../format/readFormatInfoDetailed';

export function readFormatInfo(matrix: boolean[][]): FormatInfo | null {
  const moduleCount = matrix.length;
  qrLogLazy('debug', () => `readFormatInfo: moduleCount=${moduleCount}`);

  if (moduleCount < 21) {
    qrLogLazy('debug', () => `readFormatInfo: FAILED - moduleCount < 21`);
    return null;
  }

  const d = readFormatInfoDetailed(matrix);

  if (d.format1Bits !== null && d.format2Bits !== null) {
    qrLogLazy('debug', () => `[QR-DEBUG] readFormatInfo: format1 bits=${d.format1Bits.toString(2).padStart(15, '0')}, format2 bits=${d.format2Bits.toString(2).padStart(15, '0')}`);
}

  const logDecoded = (x: DecodedFormatInfo | null) =>
    x ? `ECC=${x.eccLevel},mask=${x.maskPattern},dist=${x.dist}` : 'null';

  qrLogLazy('debug', () => `readFormatInfo: decoded1=${logDecoded(d.decoded1)}, decoded2=${logDecoded(d.decoded2)}, agree=${d.agree}`);

  const result = d.best ? { eccLevel: d.best.eccLevel, maskPattern: d.best.maskPattern } : null;
  qrLogLazy('debug', () => `[QR-DEBUG] readFormatInfo: RESULT=${result ? `ECC=${result.eccLevel},mask=${result.maskPattern}` : 'null'}`);

  return result;
}

