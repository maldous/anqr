/**
 * QR Bit Buffer
 * Buffer for building QR code data bit stream
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('ENCODER');

import type { QRBitBuffer } from '../../../modules/qr-encoder/types';

/**
 * Create a new bit buffer for QR data encoding
 */
export function qrBitBuffer(): QRBitBuffer {
  const _buffer: number[] = [];
  let _length = 0;

  const _this: QRBitBuffer = {
    getBuffer: () => _buffer,

    getAt: (index: number): boolean => {
      const bufIndex = Math.floor(index / 8);
      return ((_buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
    },

    put: (num: number, length: number): void => {
      for (let i = 0; i < length; i += 1) {
        _this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },

    getLengthInBits: () => _length,

    putBit: (bit: boolean): void => {
      const bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= 0x80 >>> (_length % 8);
      }

      _length += 1;
    },
  };

  return _this;
}
