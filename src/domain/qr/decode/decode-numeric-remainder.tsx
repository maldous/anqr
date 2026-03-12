import { qrDecoderLog } from './qr-decoder-log';
import { BitStream } from './bit-stream';

export function decodeNumericRemainder(bits: BitStream, remaining: number): string {
  if (remaining === 2 && bits.available() >= 7) {
    const value = bits.read(7);
    if (value > 99) {
      qrDecoderLog.debug('numeric: Invalid 2-digit value', { value });
      return '??';
    }
    return value.toString().padStart(2, '0');
  }
  if (remaining === 1 && bits.available() >= 4) {
    const value = bits.read(4);
    if (value > 9) {
      qrDecoderLog.debug('numeric: Invalid 1-digit value', { value });
      return '?';
    }
    return value.toString();
  }
  return '';
}
