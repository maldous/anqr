export function detectEncodingMode(
  payload: string
): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' {
  if (/^\d+$/.test(payload)) return 'numeric';
  if (/^[0-9A-Z $%*+\-./:]+$/.test(payload)) return 'alphanumeric';
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(payload)) return 'kanji';
  return 'byte';
}
