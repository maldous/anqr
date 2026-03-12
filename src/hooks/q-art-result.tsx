import type { QArtModule } from './q-art-module';

export type QArtResult = Awaited<ReturnType<QArtModule['generateFullQArtOptimal']>>;
