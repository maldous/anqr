import { qrDecoderLog } from './qr-decoder-log';
import type { SegmentDecodeResult } from './segment-decode-result';
import { stringToOutBytes } from './string-to-out-bytes';

export function buildTextSegmentResult(
  params: Readonly<{
    charCount: number;
    logLabel: string;
    modeTag: 'alphanumeric' | 'numeric';
    text: string;
  }>
): SegmentDecodeResult {
  if (params.text.length !== params.charCount) {
    qrDecoderLog.debug(`decode: ${params.logLabel} segment truncated - decode invalid`, {
      expected: params.charCount,
      got: params.text.length,
    });
  }

  return {
    text: params.text,
    rawBytes: [],
    outBytes: stringToOutBytes(params.text),
    modeTag: params.modeTag,
    valid: params.text.length === params.charCount,
  };
}
