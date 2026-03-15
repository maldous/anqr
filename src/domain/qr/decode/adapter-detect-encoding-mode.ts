export function detectEncodingMode(
  text: string
): 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' {
  if (/^\d+$/.test(text)) return 'numeric';
  if (/^[0-9A-Z $%*+\-./:]+$/.test(text)) return 'alphanumeric';
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) return 'kanji';
  return 'byte';
}
