import type { QArtModule } from './q-art-module';
import { qartModulePromiseState } from './qart-module-promise-state';

export function setQartModulePromise(value: Promise<QArtModule> | null) {
  qartModulePromiseState.current = value;
}
