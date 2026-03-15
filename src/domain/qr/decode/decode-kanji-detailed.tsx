import { BitStream } from './bit-stream';

/**
 * Decode Kanji mode and preserve raw bytes (Shift-JIS).
 */
export function decodeKanjiDetailed(
  bits: BitStream,
  count: number
): { text: string; bytes: number[] } {
  const bytes: number[] = [];

  for (let i = 0; i < count; i++) {
    if (bits.available() < 13) break;
    let value = bits.read(13);

    // Convert to Shift-JIS
    const byte1 = Math.floor(value / 0xc0);
    const byte2 = value % 0xc0;
    value = (byte1 << 8) | byte2;

    if (value < 0x01f00) {
      value += 0x8140;
    } else {
      value += 0xc140;
    }

    bytes.push((value >> 8) & 0xff);
    bytes.push(value & 0xff);
  }

  let text = '';
  try {
    text = new TextDecoder('shift-jis').decode(new Uint8Array(bytes));
  } catch {
    text = '';
  }

  return { text, bytes };
}
