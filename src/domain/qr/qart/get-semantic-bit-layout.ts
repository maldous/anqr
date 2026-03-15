import { QRMode } from '../../../modules/qr-encoder/types';
import { getLengthInBits } from '../encode/utils';
import { type ECCLevel, getRSBlockInfo } from './bit-mapping';
import type { SemanticBitLayout } from './semantic-layout.types';
import { log } from './log';

/**
 * Calculate the semantic bit layout for a QR code
 *
 * This precisely tracks where each semantic region starts and ends,
 * which is critical for knowing which bits can be safely modified.
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param dataLength Length of the data string in characters
 * @returns Complete semantic bit layout
 */
export function getSemanticBitLayout(
  version: number,
  ecc: ECCLevel,
  dataLength: number
): SemanticBitLayout {
  // Calculate total data capacity
  const blocks = getRSBlockInfo(version, ecc);
  const totalDataBytes = blocks.reduce((sum, b) => sum + b.dataCount, 0);
  const totalDataBits = totalDataBytes * 8;

  // Mode indicator: always 4 bits
  const modeIndicatorStart = 0;
  const modeIndicatorEnd = 4;

  // Character count: depends on version and mode (using byte mode)
  const charCountBits = getLengthInBits(QRMode.MODE_8BIT_BYTE, version);
  const characterCountStart = modeIndicatorEnd;
  const characterCountEnd = characterCountStart + charCountBits;

  // Data content: 8 bits per character in byte mode
  const dataContentStart = characterCountEnd;
  const dataContentEnd = dataContentStart + dataLength * 8;

  // How many bits used so far
  let currentBit = dataContentEnd;

  // Terminator: up to 4 bits (0000), but only as many as fit
  const remainingBitsForTerminator = totalDataBits - currentBit;
  const terminatorBits = Math.min(4, remainingBitsForTerminator);
  const terminatorStart = currentBit;
  const terminatorEnd = terminatorStart + terminatorBits;
  currentBit = terminatorEnd;

  // Pad-to-byte: zero bits to reach byte boundary
  const bitsToNextByte = (8 - (currentBit % 8)) % 8;
  const padToByteStart = currentBit;
  const padToByteEnd = padToByteStart + bitsToNextByte;
  currentBit = padToByteEnd;

  // Pad codewords: remaining bytes filled with 0xEC 0x11 pattern
  const padCodewordsStart = currentBit;
  const padCodewordsEnd = totalDataBits;
  const padCodewordsByteCount = (padCodewordsEnd - padCodewordsStart) / 8;

  const layout: SemanticBitLayout = {
    modeIndicator: { startBit: modeIndicatorStart, endBit: modeIndicatorEnd },
    characterCount: { startBit: characterCountStart, endBit: characterCountEnd },
    dataContent: { startBit: dataContentStart, endBit: dataContentEnd },
    terminator: { startBit: terminatorStart, endBit: terminatorEnd },
    padToByte: { startBit: padToByteStart, endBit: padToByteEnd },
    padCodewords: {
      startBit: padCodewordsStart,
      endBit: padCodewordsEnd,
      byteCount: padCodewordsByteCount,
    },
    totalDataBits,
    totalDataBytes,
    version,
    ecc,
    dataLength,
  };

  log.info('Semantic bit layout calculated', {
    version,
    ecc,
    dataLength,
    totalDataBytes,
    totalDataBits,
    modeIndicator: `bits ${modeIndicatorStart}-${modeIndicatorEnd} (${modeIndicatorEnd - modeIndicatorStart} bits)`,
    characterCount: `bits ${characterCountStart}-${characterCountEnd} (${charCountBits} bits)`,
    dataContent: `bits ${dataContentStart}-${dataContentEnd} (${dataLength * 8} bits)`,
    terminator: `bits ${terminatorStart}-${terminatorEnd} (${terminatorBits} bits)`,
    padToByte: `bits ${padToByteStart}-${padToByteEnd} (${bitsToNextByte} bits)`,
    padCodewords: `bits ${padCodewordsStart}-${padCodewordsEnd} (${padCodewordsByteCount} bytes)`,
    controllableBits: padCodewordsEnd - padCodewordsStart,
    controllablePercent: `${(((padCodewordsEnd - padCodewordsStart) / totalDataBits) * 100).toFixed(1)}%`,
  });

  return layout;
}
