import type { ECCLevel } from './bit-mapping';
import type { SemanticValidationResult } from './validation';
import { stringToBytes } from './string-to-bytes';
import { toHex } from './to-hex';
import { log } from './log';
import type { ScanResult } from './scan-result';

export function evaluateSemanticGateResult(
  semanticValidation: SemanticValidationResult,
  scanResult: ScanResult,
  data: string,
  originalDataLength: number,
  ecc: ECCLevel,
  actualMask: number,
  strictSuffix: boolean
): ScanResult {
  if (semanticValidation.valid) {
    log.info('QR-Art SEMANTIC-HARD-GATE validation PASSED', {
      originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
      originalDataLength,
      decodedDataLength: scanResult.data?.length,
      ecc,
      mask: actualMask,
      strictSuffix,
      structurallyValid: scanResult.structurallyValid,
      segmentCount: scanResult.segmentCount,
      segmentModes: scanResult.segments?.map((s) => s.modeName),
      validationMethod: 'SEMANTIC_HARD_GATE',
      checksPerformed: [
        'SCAN_SUCCESS',
        'LENGTH_CHECK',
        'BYTE_EXACT_PREFIX',
        'ECC_INVARIANT',
        'MASK_INVARIANT',
        'STRUCTURAL_VALIDITY',
        strictSuffix ? 'SUFFIX_CHARSET_STRICT' : 'SUFFIX_CHARSET_SOFT',
      ],
    });
    return scanResult;
  }

  log.warn('QR-Art SEMANTIC-HARD-GATE validation FAILED', {
    rejectionReason: semanticValidation.reason,
    description: semanticValidation.description,
    details: semanticValidation.details,
    originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
    originalDataLength,
    ecc,
    mask: actualMask,
    structurallyValid: scanResult.structurallyValid,
    segmentCount: scanResult.segmentCount,
    segmentModes: scanResult.segments?.map((s) => s.modeName),
    segments: scanResult.segments?.map((s) => ({
      mode: s.modeName,
      charCount: s.charCount,
      valid: s.valid,
      bitOffset: s.bitOffset,
    })),
    note: 'Candidate rejected by semantic-hard-gate',
  });

  if (scanResult.success && scanResult.data) {
    const expectedBytes = stringToBytes(data);
    const actualBytes = stringToBytes(scanResult.data);
    log.warn('DECODED BYTES (hex comparison)', {
      decodedPrefixHex: toHex(actualBytes.slice(0, originalDataLength)),
      expectedPrefixHex: toHex(expectedBytes),
      mismatchIndex: semanticValidation.details?.mismatchIndex,
      expectedByte: semanticValidation.details?.expectedByte?.toString(16),
      actualByte: semanticValidation.details?.actualByte?.toString(16),
    });
  }

  return {
    success: false,
    error: `Semantic validation failed: ${semanticValidation.reason} - ${semanticValidation.description}`,
  };
}
