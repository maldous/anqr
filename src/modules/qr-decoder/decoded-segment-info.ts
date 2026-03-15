export interface DecodedSegmentInfo {
  index: number;
  mode: number;
  modeName: 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'eci' | 'terminator' | 'unknown';
  charCount: number;
  decodedLength: number;
  valid: boolean;
  bitOffset: number;
}
