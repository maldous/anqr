import { qrBitBuffer } from '../encode/bit-buffer';
import { getRSBlocks } from '../encode/rs-blocks';
import { getLengthInBits } from '../encode/utils';
import type { ECCLevel } from './bit-mapping';
import { log } from './log-2';
import { eccToNumericForEncoder } from './ecc-to-numeric-for-encoder';
import { writeSegmentsToBuffer } from './write-segments-to-buffer';
import { computeTwoIntervalSafeRanges } from './compute-two-interval-safe-ranges';
import { extractBlocksFromBuffer } from './extract-blocks-from-buffer';
import type { QArtEncodingPlan } from './q-art-encoding-plan';
import type { EncoderDerivedLayout } from './generate.types';

export function encodeDataToBytes(
  plan: QArtEncodingPlan,
  version: number,
  ecc: ECCLevel
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  encoderLayout: EncoderDerivedLayout;
} {
  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);
  const buffer = qrBitBuffer();

  const suffixLength = plan.suffixLength;
  const originalDataLength = plan.originalDataLength;
  const suffixMode: 'byte' | 'numeric' = plan.mode === 'numeric' ? 'numeric' : 'byte';

  const segments = writeSegmentsToBuffer(plan, buffer, version);
  const {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData,
    originalDataPreview,
    suffixPreview,
    fullDataLength,
  } = segments;

  log.debug(`encodeDataToBytes called (HYBRID ${suffixMode} mode)`, {
    fullDataLength,
    originalDataLength,
    suffixLength,
    originalDataPreview,
    suffixPreview,
    version,
    ecc,
    suffixMode,
  });

  // Calculate total data capacity
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  // Add terminator if there's room (up to 4 bits of zeros)
  const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
  const terminatorBits = Math.min(4, remainingBits);
  if (terminatorBits > 0) {
    buffer.put(0, terminatorBits);
  }

  // CHECKPOINT 5: After terminator
  const bitsAfterTerminator = buffer.getLengthInBits();

  // Pad to byte boundary with zeros
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }

  // CHECKPOINT 6: After padding to byte boundary
  const bitsAfterPadToByte = buffer.getLengthInBits();

  // CRITICAL: This is where padding codewords start (byte index)
  const paddingStartByte = buffer.getLengthInBits() / 8;

  // Add padding bytes (0xEC 0x11 pattern)
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (buffer.getLengthInBits() < totalDataCount * 8) {
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD1, 8);
    }
  }

  // Calculate padding byte count
  const paddingByteCount = totalDataCount - paddingStartByte;

  // Compute two-interval safe mutation ranges
  const safeRanges = computeTwoIntervalSafeRanges(
    bitsAfterOriginalData,
    bitsAfterData,
    paddingStartByte,
    totalDataCount,
    suffixMode,
    suffixLength,
    version,
    buffer
  );
  const {
    protectedBitEnd,
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    gapStartBit,
    gapEndBit,
    gapBitCount,
    suffixSafeBits,
    paddingSafeBits,
    allowedBitRanges,
  } = safeRanges;
  const totalControllableBits = suffixSafeBits + paddingSafeBits;

  // Legacy fields for backwards compatibility
  const allowedBitStart = suffixSafeStartBit;
  const allowedBitEnd = paddingSafeEndBit;

  // Build the encoder-derived layout with TWO-INTERVAL safe ranges
  const encoderLayout: EncoderDerivedLayout = {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData,
    bitsAfterTerminator,
    bitsAfterPadToByte,
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    originalDataLength,
    suffixLength,
    suffixMode,
    // Protection boundary (mode + charCount + original data)
    protectedBitEnd,
    // TWO-INTERVAL safe mutation ranges (byte-aligned, excludes terminator)
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    // The protected gap (terminator + pad-to-byte)
    gapStartBit,
    gapEndBit,
    gapBitCount,
    // The two allowed bit ranges for RS basis building
    allowedBitRanges,
    // Legacy fields for backwards compatibility
    allowedBitStart,
    allowedBitEnd,
    suffixBits: suffixSafeBits,
    paddingBits: paddingSafeBits,
  };

  // Log the ACTUAL semantic boundaries from the encoder (HYBRID mode)
  // This now shows the TWO-INTERVAL safe ranges and the protected gap
  log.info('ENCODER-DERIVED SEMANTIC BOUNDARIES (TWO-INTERVAL HYBRID mode)', {
    version,
    ecc,
    originalDataLength,
    suffixLength,
    fullDataLength,
    encoding: suffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    checkpoints: {
      bitsAfterMode: `${bitsAfterMode} bits (mode indicator)`,
      bitsAfterCharCount: `${bitsAfterCharCount} bits (+char count)`,
      bitsAfterOriginalData: `${bitsAfterOriginalData} bits (+original data)`,
      bitsAfterData: `${bitsAfterData} bits (+suffix data)`,
      bitsAfterTerminator: `${bitsAfterTerminator} bits (+terminator)`,
      bitsAfterPadToByte: `${bitsAfterPadToByte} bits (+pad-to-byte)`,
    },
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    protection: {
      protectedBits: `0 - ${protectedBitEnd} (mode + charCount + original data)`,
      protectedBytes: Math.ceil(protectedBitEnd / 8),
    },
    twoIntervalSafeRanges: {
      interval1_suffix:
        suffixSafeEndBit > suffixSafeStartBit
          ? `bits ${suffixSafeStartBit} - ${suffixSafeEndBit} (${suffixSafeBits} bits, ${suffixSafeBits / 8} bytes)`
          : 'NONE (suffix too short or ends mid-byte)',
      interval2_padding:
        paddingSafeEndBit > paddingSafeStartBit
          ? `bits ${paddingSafeStartBit} - ${paddingSafeEndBit} (${paddingSafeBits} bits, ${paddingSafeBits / 8} bytes)`
          : 'NONE (no padding codewords)',
      gap_protected:
        gapBitCount > 0
          ? `bits ${gapStartBit} - ${gapEndBit} (${gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!]`
          : 'NONE (no gap)',
    },
    controllable: {
      totalControllableBits,
      controllablePercent: `${((totalControllableBits / (totalDataCount * 8)) * 100).toFixed(1)}%`,
      numIntervals: allowedBitRanges.length,
    },
  });

  // Extract bytes for each block and compute ECC
  const bufferBytes = buffer.getBuffer();

  // Log first 32 bytes of the encoded buffer for debugging
  log.debug('ENCODE SUMMARY - first 32 bytes of buffer', {
    bufferBits: buffer.getLengthInBits(),
    bufferBytesLen: bufferBytes.length,
    first32Bytes: Array.from(bufferBytes.slice(0, 32)),
  });

  const blocks = extractBlocksFromBuffer(bufferBytes, rsBlocks);

  return { ...blocks, encoderLayout };
}
