export interface FullQArtPipelineResult {
  success: boolean;
  error?: string;
  matrix?: boolean[][];
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  modifiedData?: string;
  segments?: Array<{ data: string; mode: string }>;
  version?: number;
  maskPattern?: number;
  moduleCount?: number;
  encodedData?: Uint8Array;
  packedMatrix?: Uint8Array;
  bitmap?: ImageBitmap;
}
