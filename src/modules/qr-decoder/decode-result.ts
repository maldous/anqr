import type { DecodedSegmentInfo } from './decoded-segment-info';
import type { DecoderMetadata } from './decoder-metadata';
import type { Point } from './point';

export interface DecodeResult {
  success: boolean;
  data: string | null;
  dataBytes?: Uint8Array | null;
  error: string | null;
  location: {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomLeftCorner: Point;
    bottomRightCorner: Point;
  } | null;
  version: number | null;
  eccLevel: 'L' | 'M' | 'Q' | 'H' | null;
  maskPattern: number | null;
  encodingMode?: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed' | 'unknown' | null;
  errorsCorrected?: number | null;
  erasures?: number | null;
  orientation?: number | null;
  numBits?: number | null;
  structuredAppendSequence?: number | null;
  structuredAppendParity?: number | null;
  decoderMetadata?: DecoderMetadata;
  structurallyValid?: boolean;
  segmentCount?: number;
  segments?: DecodedSegmentInfo[];
}
