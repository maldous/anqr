import type { QArtModule } from './qart-shared-types';
import { qartSharedState } from './qart-shared-state-store';

export function setQartModulePromise(promise: Promise<QArtModule>): void {
  qartSharedState.modulePromise = promise;
}
