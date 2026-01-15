import {ECCLevel, bit, eccLevel, errorsCorrected, maskPattern, matrix, of, payload, payloadBytes} from '../shared';
/**
 * Decode payload from module matrix using reverse of mapData algorithm.
 *
 * This walks the matrix in the same zig-zag order as qrcode.mjs:mapData,
 * skipping structural modules and un-applying the mask. It then parses
 * the resulting bit stream into segments according to the QR spec.
 */
export function decodePayload(
  matrix: boolean[][],
  moduleCount: number,
  maskPattern: number,
  version: number,
  eccLevel: ECCLevel | null
): { payload: string; payloadBytes: Uint8Array; errorsCorrected: number | null }

