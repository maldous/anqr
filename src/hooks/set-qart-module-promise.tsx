import type { QArtModule } from './q-art-module';
import { setQartModulePromiseState } from './qart-module-promise-state';

export function setQartModulePromise(value: Promise<QArtModule> | null) {
  setQartModulePromiseState(value);
}
