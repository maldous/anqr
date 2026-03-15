import { stringToBytesFn } from './string-bytes';
import type { QRBitBuffer, QRDataSegment } from '../../../modules/qr-encoder/types';
import { QRMode } from '../../../modules/qr-encoder/types';

/**
 * Kanji mode encoder (Shift-JIS)
 */
export function qrKanji(data: string): QRDataSegment {
  const _mode = QRMode.MODE_KANJI;

  // Self test for sjis support
  const test = stringToBytesFn('\u53cb');
  if (test.length !== 2 || ((test[0] << 8) | test[1]) !== 0x9746) {
    throw new Error('sjis not supported.');
  }

  const _bytes = stringToBytesFn(data);

  return {
    getMode: () => _mode,
    getLength: () => Math.trunc(_bytes.length / 2),
    write: (buffer: QRBitBuffer): void => {
      let i = 0;

      while (i + 1 < _bytes.length) {
        let c = ((0xff & _bytes[i]) << 8) | (0xff & _bytes[i + 1]);

        if (0x8140 <= c && c <= 0x9ffc) {
          c -= 0x8140;
        } else if (0xe040 <= c && c <= 0xebbf) {
          c -= 0xc140;
        } else {
          throw new Error(`illegal char at ${i + 1}/${c}`);
        }

        c = ((c >>> 8) & 0xff) * 0xc0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < _bytes.length) {
        throw new Error(`illegal char at ${i + 1}`);
      }
    },
  };
}
