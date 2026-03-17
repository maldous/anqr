export interface QArtWorkerResultPayload {
  success: boolean;
  error?: string;
  matrix?: Uint8Array;
  bitmap?: ImageBitmap;
  moduleCount: number;
  version: number;
  maskPattern: number;
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  encodedData?: string;
}
