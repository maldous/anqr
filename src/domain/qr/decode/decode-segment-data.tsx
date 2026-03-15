import {
  MODE_ALPHANUMERIC,
  MODE_BYTE,
  MODE_KANJI,
  MODE_NUMERIC,
} from '../../../modules/qr-decoder/types';
import { qrDecoderLog } from './qr-decoder-log';
import { decodeNumeric } from './decode-numeric';
import { decodeAlphanumeric } from './decode-alphanumeric';
import { decodeByteDetailed } from './decode-byte-detailed';
import { decodeKanjiDetailed } from './decode-kanji-detailed';
import { BitStream } from './bit-stream';
import { buildTextSegmentResult } from './build-text-segment-result';
import type { SegmentDecodeResult } from './segment-decode-result';

export function decodeSegmentData(
  bits: BitStream,
  mode: number,
  charCount: number
): SegmentDecodeResult {
  switch (mode) {
    case MODE_NUMERIC: {
      return buildTextSegmentResult({
        charCount,
        logLabel: 'Numeric',
        modeTag: 'numeric',
        text: decodeNumeric(bits, charCount),
      });
    }
    case MODE_ALPHANUMERIC: {
      return buildTextSegmentResult({
        charCount,
        logLabel: 'Alphanumeric',
        modeTag: 'alphanumeric',
        text: decodeAlphanumeric(bits, charCount),
      });
    }
    case MODE_BYTE: {
      const r = decodeByteDetailed(bits, charCount);
      if (r.bytes.length !== charCount) {
        qrDecoderLog.debug('decode: Byte segment truncated - decode invalid', {
          expected: charCount,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'byte',
        valid: r.bytes.length === charCount,
      };
    }
    case MODE_KANJI: {
      const r = decodeKanjiDetailed(bits, charCount);
      if (r.bytes.length !== charCount * 2) {
        qrDecoderLog.debug('decode: Kanji segment truncated - decode invalid', {
          expected: charCount * 2,
          got: r.bytes.length,
        });
      }
      return {
        text: r.text,
        rawBytes: r.bytes,
        outBytes: [...r.bytes],
        modeTag: 'kanji',
        valid: r.bytes.length === charCount * 2,
      };
    }
    default: {
      qrDecoderLog.debug('decode: Unknown mode indicator - decode invalid', { mode });
      return { text: '', rawBytes: [], outBytes: [], modeTag: 'unknown', valid: false };
    }
  }
}
