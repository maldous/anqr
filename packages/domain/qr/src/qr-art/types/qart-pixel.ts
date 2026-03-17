export interface QArtPixel {
  row: number;
  col: number;
  isStructural: boolean;
  isData: boolean;
  bitIndex: number;
  controllable: boolean;
  targetValue: boolean;
  importance: number;
}
