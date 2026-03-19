import type { QArtWorkerRuntime } from "../runtime/generator-runtime.types";

type QArtDomainModule = typeof import("@/domain/qr/qart");

export type QArtModule = QArtDomainModule & QArtWorkerRuntime;

export type QArtWorkerResult = Awaited<ReturnType<QArtModule["generateQArtInWorker"]>>;

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
