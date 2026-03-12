/**
 * Shared type definitions extracted from useQRGenerator.ts
 * for use by split scaffold files.
 */

export type QArtModule = typeof import('@/modules/qr-art');
export type QArtWorkerResult = Awaited<ReturnType<QArtModule['generateQArtInWorker']>>;

/**
 * Extended QArt result with properties from FullQArtResult.
 * Used by scaffold files that handle the full pipeline result.
 */
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
