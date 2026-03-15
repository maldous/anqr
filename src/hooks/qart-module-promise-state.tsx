import type { QArtModule } from './q-art-module';

export const qartModulePromiseState: {
  current: Promise<QArtModule> | null;
} = {
  current: null,
};
