import type { ECCLevel } from './bit-mapping';
import { computeECC } from './rs-basis';
import { arraysEqual } from './arrays-equal';
import { log } from './log';
import { createQREncoderForGenerate } from './create-qr-encoder-for-generate';
import { extractActualMaskPattern } from './extract-actual-mask-pattern';
import { logFormatVerificationDiagnostic } from './log-format-verification-diagnostic';
import { logMatrixMismatchDiagnostic } from './log-matrix-mismatch-diagnostic';
import { encodeDataToBytes } from './encode-data-to-bytes';
import { regenerateQRFromModifiedData } from './regenerate-qr-from-modified-data';
import type { BaseQRResult } from './base-qr-result';
import type { QArtEncodingPlan } from './q-art-encoding-plan';

export function generateBaseQR(
  data: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number,
  originalDataLength: number,
  suffixMode: 'byte' | 'numeric'
): BaseQRResult {
  // Log the exact data being encoded for debugging
  log.debug('generateBaseQR called', {
    dataLength: data.length,
    dataPreview: data.length > 80 ? `${data.slice(0, 80)}...` : data,
    dataHash: data
      .split('')
      .reduce((a, c) => Math.trunc((a << 5) - a + (c.codePointAt(0) ?? 0)), 0)
      .toString(16),
    version,
    ecc,
    maskPattern,
  });

  // First, use the encoder to determine the actual version if auto-detecting
  const useMask = maskPattern >= 0 ? maskPattern : undefined;
  const qr = createQREncoderForGenerate(
    data,
    originalDataLength,
    suffixMode,
    ecc,
    version,
    useMask
  );

  const moduleCount = qr.getModuleCount();
  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);

  const actualMask = extractActualMaskPattern(qr, moduleCount, ecc, maskPattern);

  // Get the actual encoded data bytes and compute ECC using the encoder's bit buffer
  // This is critical - we need the real data bytes AND their ECC for RS linearity
  // Also captures the ACTUAL semantic bit positions from the encoder
  // HYBRID MODE: Pass originalDataLength to track protection boundaries
  const plan: QArtEncodingPlan =
    suffixMode === 'numeric'
      ? {
          mode: 'numeric',
          prefix: data.slice(0, originalDataLength),
          suffix: data.slice(originalDataLength),
          originalDataLength,
          suffixLength: data.length - originalDataLength,
        }
      : {
          mode: 'byte',
          fullData: data,
          originalDataLength,
          suffixLength: data.length - originalDataLength,
        };

  const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout } =
    encodeDataToBytes(plan, actualVersion, ecc);

  // DEBUG: Verify that computeECC produces the same ECC as the encoder
  for (let i = 0; i < blockDataArrays.length; i++) {
    const testEcc = computeECC(blockDataArrays[i], blockEccCounts[i]);
    const encoderEcc = blockEccArrays[i];
    if (arraysEqual(testEcc, encoderEcc)) {
      log.debug('ECC verification passed for block', { blockIndex: i });
    } else {
      log.warn('ECC MISMATCH - computeECC differs from encoder!', {
        blockIndex: i,
        dataCount: blockDataCounts[i],
        eccCount: blockEccCounts[i],
        computeEccFirst5: Array.from(testEcc.slice(0, 5)),
        encoderEccFirst5: Array.from(encoderEcc.slice(0, 5)),
      });
    }
  }

  // CRITICAL: Generate the base matrix using the SAME function that generates
  // the final matrix. This ensures prediction and actual match exactly.
  // Previously we extracted from qr.isDark() which uses a different code path.
  const matrix = regenerateQRFromModifiedData(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );

  // DIAGNOSTIC VERIFICATION + DEBUG: Compare matrices
  logFormatVerificationDiagnostic(matrix, ecc, actualMask);
  logMatrixMismatchDiagnostic(
    matrix,
    data,
    originalDataLength,
    suffixMode,
    ecc,
    actualVersion,
    actualMask,
    moduleCount
  );

  return {
    success: true,
    matrix,
    actualVersion,
    actualMask,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    encoderLayout,
  };
}
