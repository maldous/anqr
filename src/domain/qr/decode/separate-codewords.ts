import { RS_BLOCKS } from './rs-blocks';
import { deinterleaveDataCodewords } from './deinterleave-data-codewords';
import { qrDecoderLog } from './qr-decoder-log';

/**
 * Separate data and error correction codewords
 */
export function separateCodewords(
  codewords: number[],
  version: number,
  eccLevel: number
): { dataCodewords: number[]; ecCodewords: number[] } {
  const eccLevelChar = ['M', 'L', 'H', 'Q'][eccLevel];
  const rsBlocks = RS_BLOCKS[eccLevelChar]?.[version - 1];

  qrDecoderLog.trace('separate: Separating codewords', {
    version,
    eccLevel,
    eccLevelChar,
    hasRsBlocks: !!rsBlocks,
  });

  if (!rsBlocks) {
    qrDecoderLog.warn('separate: No RS blocks found for version/ECC, returning all as data');
    return { dataCodewords: codewords, ecCodewords: [] };
  }

  // Calculate total data codewords
  let totalDataCodewords = 0;
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const dataCodewords = blockGroup[2];
    totalDataCodewords += numBlocks * dataCodewords;
  }

  // Extract interleaved data codewords
  const interleavedData = codewords.slice(0, totalDataCodewords);

  // De-interleave for multi-block QR codes
  const dataCodewords = deinterleaveDataCodewords(interleavedData, rsBlocks);

  qrDecoderLog.trace('separate: Separated codewords', {
    totalCodewords: codewords.length,
    dataCodewords: totalDataCodewords,
    ecCodewords: codewords.length - totalDataCodewords,
  });

  return {
    dataCodewords,
    ecCodewords: codewords.slice(totalDataCodewords),
  };
}
