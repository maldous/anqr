import type { QRBitBuffer as QRBitBufferType } from '../../../modules/qr-encoder/types';

const PAD0 = 0xec;
const PAD1 = 0x11;

export function padDataBuffer(buffer: QRBitBufferType, totalDataCount: number): void {
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() >= totalDataCount * 8) break;
    buffer.put(PAD1, 8);
  }
}
