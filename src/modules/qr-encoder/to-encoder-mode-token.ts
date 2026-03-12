import type { EncodingMode } from './encoder-api.types';
import { getCompatibleMode } from './get-compatible-mode';

export function toEncoderModeToken(
  mode: EncodingMode | 'numeric' | 'alphanumeric' | 'byte' | 'kanji',
  content: string
): string | undefined {
  // For explicit segment modes, use directly
  if (mode === 'numeric') return 'Numeric';
  if (mode === 'alphanumeric') return 'Alphanumeric';
  if (mode === 'kanji') return 'Kanji';
  if (mode === 'byte') return 'Byte';

  const compatible = getCompatibleMode(content, mode);
  switch (compatible) {
    case 'numeric':
      return 'Numeric';
    case 'alphanumeric':
      return 'Alphanumeric';
    case 'kanji':
      return 'Kanji';
    default:
      return 'Byte';
  }
}
