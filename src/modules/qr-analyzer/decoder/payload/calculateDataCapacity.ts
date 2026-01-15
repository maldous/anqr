import {DATA_CAPACITY_BYTE, ECCLevel, QRAnalysisResult, bytes, dataCapacity, eccLevel, for, payload, total} from '../shared';
/**
 * Calculate data capacity information
 */
export function calculateDataCapacity(
  payload: string | null,
  version: number | null,
  eccLevel: ECCLevel | null
): QRAnalysisResult['dataCapacity'] {
  if (!payload || !version || !eccLevel || version < 1 || version > 40) {
    return null;
  }

  const capacity = DATA_CAPACITY_BYTE[version]?.[eccLevel];
  if (!capacity) return null;

  // Estimate bytes used (UTF-8)
  const encoder = new TextEncoder();
  const used = encoder.encode(payload).length;

  const rawPercentage = (used / capacity) * 100;
  const overflow = rawPercentage > 100;

  return {
    used,
    total: capacity,
    percentage: Math.min(Math.round(rawPercentage), 100), // Cap at 100 for display
    overflow,
  };
}

