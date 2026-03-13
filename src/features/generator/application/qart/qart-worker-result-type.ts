import type { QArtModule } from './qart-module';

export type QArtWorkerResult = Awaited<ReturnType<QArtModule['generateQArtInWorker']>>;
