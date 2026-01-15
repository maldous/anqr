import {DecodedFormatInfo, FormatInfoDetailed, agree, best, decoded1, decoded2, dist, eccLevel, maskPattern, matrix} from '../shared';
import { decodeFormatInfoBCH } from '../format/decodeFormatInfoBCH';
import { readFormatInfoFromSecondary } from '../format/readFormatInfoFromSecondary';
import { readFormatInfoFromTopLeft } from '../format/readFormatInfoFromTopLeft';


export function readFormatInfoDetailed(matrix: boolean[][]): FormatInfoDetailed {
  const moduleCount = matrix.length;

  const format1Bits = moduleCount >= 21 ? readFormatInfoFromTopLeft(matrix) : null;
  const format2Bits = moduleCount >= 21 ? readFormatInfoFromSecondary(matrix) : null;

  const decoded1 = format1Bits !== null ? decodeFormatInfoBCH(format1Bits) : null;
  const decoded2 = format2Bits !== null ? decodeFormatInfoBCH(format2Bits) : null;

  const agree =
    !!decoded1 &&
    !!decoded2 &&
    decoded1.eccLevel === decoded2.eccLevel &&
    decoded1.maskPattern === decoded2.maskPattern;

  let best: DecodedFormatInfo | null = null;
  if (decoded1 && decoded2) {
    best = decoded1.dist <= decoded2.dist ? decoded1 : decoded2;
  } else {
    best = decoded1 || decoded2 || null;
  }

  const bestDist = best ? best.dist : 999;
  const totalDist = (decoded1 ? decoded1.dist : 99) + (decoded2 ? decoded2.dist : 99);

  return {
    format1Bits,
    format2Bits,
    decoded1,
    decoded2,
    best,
    agree,
    bestDist,
    totalDist,
  };
}

