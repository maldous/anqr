import {A, EncodingMode, byte, decoded, for, mode, payload, s, valid} from '../shared';
// ============================================
// ENCODING MODE DETECTION
// ============================================

/**
 * Detect encoding mode from the decoded payload
 */
export function detectEncodingMode(payload: string): EncodingMode {
  if (!payload || payload.length === 0) {
    return 'unknown';
  }
  
  // Check if all numeric
  if (/^[0-9]+$/.test(payload)) {
    return 'numeric';
  }
  
  // Check if all alphanumeric (QR alphanumeric charset)
  // 0-9, A-Z, space, $, %, *, +, -, ., /, :
  if (/^[0-9A-Z $%*+\-./:]+$/.test(payload)) {
    return 'alphanumeric';
  }
  
  // Check for Kanji (Shift-JIS encoded Japanese)
  // This is a heuristic - look for characters in CJK ranges
  const hasCJK = /[\u3000-\u9FFF\uFF00-\uFFEF]/.test(payload);
  if (hasCJK) {
    return 'kanji';
  }
  
  // Check if it's valid ASCII/Latin-1 (byte mode)
  const hasHighBytes = /[^\x00-\xFF]/.test(payload);
  if (!hasHighBytes) {
    return 'byte';
  }
  
  // Mixed or unknown
  return 'byte';
}

