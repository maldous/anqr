export interface DecoderMetadata {
  version: number | null;
  maskPattern: number | null;
  eccLevel: 'L' | 'M' | 'Q' | 'H' | null;
  errorsCorrected: number | null;
  erasures: number | null;
  numBits: number | null;
  orientation: number | null;
  structuredAppendSequence: number | null;
  structuredAppendParity: number | null;
  hasStructuredAppend: boolean;
  byteSegmentCount: number;
  totalByteLength: number;
}
