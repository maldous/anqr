// Barrel: domain/qr/decode
export { decodeQR } from './decoder-adapter';
export { decodeFromCanvas } from './decode-canvas';
export type {
  DecodeResult,
  FinderPatternResult,
  DecodedSegmentInfo,
} from '../../../modules/qr-decoder/types';
export type { DecodedDataResult, DecodedEncodingMode } from './decode.types';
