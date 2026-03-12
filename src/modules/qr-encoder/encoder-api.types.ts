// Type aliases for QR encoding
export type ECCLevel = 'L' | 'M' | 'Q' | 'H';

export type EncodingMode = 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji' | 'mixed';

export type MaskPattern = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | -1;

export interface QROptions {
  errorCorrectionLevel?: ECCLevel;
  version?: number;
  maskPattern?: MaskPattern;
  mode?: EncodingMode;
}

export interface QRMatrix {
  modules: boolean[][];
  size: number;
  version: number;
}

export interface QRInstance {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
  make(maskPattern?: number): void;
  addData(data: string, mode?: string): void;
}

/**
 * Data segment for multi-segment encoding
 * Allows mixing different encoding modes in a single QR code
 */
export interface DataSegment {
  data: string;
  mode: 'numeric' | 'alphanumeric' | 'byte' | 'kanji';
}
