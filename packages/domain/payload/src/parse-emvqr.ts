/**
 * Parse an EMV QR code string into its component TLV fields
 */
export function parseEMVQR(payload: string): Map<string, string> {
  const fields = new Map<string, string>();
  const bytes = new TextEncoder().encode(payload);
  const decoder = new TextDecoder();
  let pos = 0;

  while (pos < bytes.length - 4) {
    const tag = decoder.decode(bytes.subarray(pos, pos + 2));
    const lengthStr = decoder.decode(bytes.subarray(pos + 2, pos + 4));
    const length = Number.parseInt(lengthStr, 10);
    if (Number.isNaN(length) || length < 0) {
      break;
    }
    const value = decoder.decode(bytes.subarray(pos + 4, pos + 4 + length));
    fields.set(tag, value);
    pos += 4 + length;
  }

  return fields;
}
