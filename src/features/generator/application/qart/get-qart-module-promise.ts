import type { QArtModule } from './qart-shared-types';
import { qartSharedState } from './qart-shared-state-store';

export function getQartModulePromise(): Promise<QArtModule> | null {
  return qartSharedState.modulePromise;
}
