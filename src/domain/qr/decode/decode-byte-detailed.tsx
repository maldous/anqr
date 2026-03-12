import { BitStream } from './bit-stream';

/**
 * Decode byte mode and preserve raw bytes.
 *
 * Text decoding strategy:
 * - Try UTF-8.
 * - If decoding yields replacement characters (U+FFFD), fall back to ISO-8859-1 (latin1).
 * This matches how many QR generators treat byte mode when no ECI is present.
 */
export function decodeByteDetailed(
  bits: BitStream,
  count: number
): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 8) break;
    bytes.push(bits.read(8));
  }

  // UTF-8 best effort
  let utf8Text = '';
  try {
    utf8Text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    utf8Text = '';
  }

  // If decoder had to replace invalid sequences, prefer a raw latin1 view.
  if (utf8Text.includes('\uFFFD')) {
    const latin1 = String.fromCodePoint(...bytes);
    return { text: latin1, bytes };
  }

  if (utf8Text.length > 0) return { text: utf8Text, bytes };

  // Fall back to ISO-8859-1
  return { text: String.fromCodePoint(...bytes), bytes };
}
