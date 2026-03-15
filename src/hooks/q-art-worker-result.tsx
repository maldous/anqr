import type { QArtModule } from './q-art-module';

export type QArtWorkerResult = Awaited<ReturnType<QArtModule['generateQArtInWorker']>>;
