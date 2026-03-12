import type { ContentType } from './analyzer-content.types';

export function detectCryptoType(lower: string): ContentType | null {
  if (lower.startsWith('bitcoin:')) return 'crypto_bitcoin';
  if (lower.startsWith('ethereum:')) return 'crypto_ethereum';
  if (lower.startsWith('litecoin:') || lower.startsWith('dogecoin:')) return 'crypto_other';
  return null;
}
