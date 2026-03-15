// ---------------------------------------------------------------------------
// 14. Plain text analyzer
// ---------------------------------------------------------------------------
export function analyzePlainText(payload: string): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {
    charCount: payload.length,
    wordCount: payload.trim().split(/\s+/).filter(Boolean).length,
    lineCount: payload.split(/\r?\n/).length,
    hasSpecialChars: /[^a-zA-Z0-9\s]/.test(payload),
    hasNonAscii: /\P{ASCII}/u.test(payload),
    hasEmoji: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(payload),
    isAllNumeric: /^\d+$/.test(payload),
    isAllAlphanumeric: /^[0-9A-Z $%*+\-./:]+$/i.test(payload),
    encodingRecommendation: 'Byte mode',
    preview: payload.length > 200 ? `${payload.slice(0, 200)}...` : payload,
  };

  if (result.isAllNumeric) {
    result.encodingRecommendation = 'Numeric mode (most efficient)';
  } else if (result.isAllAlphanumeric && !result.hasNonAscii) {
    result.encodingRecommendation = 'Alphanumeric mode (efficient)';
  } else if (result.hasNonAscii) {
    result.encodingRecommendation = 'Byte mode (UTF-8 required)';
  }

  return result;
}
