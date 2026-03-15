import type { DecodedEncodingMode } from './decode.types';

export interface SegmentDecodeResult {
  text: string;
  rawBytes: number[];
  outBytes: number[];
  modeTag: DecodedEncodingMode;
  valid: boolean;
}
