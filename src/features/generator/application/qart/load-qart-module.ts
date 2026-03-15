import type { QArtModule } from './qart-shared-types';
import { qartSharedState } from './qart-shared-state-store';

export function loadQArtModule(): Promise<QArtModule> {
  qartSharedState.modulePromise ??= import('@/modules/qr-art');
  return qartSharedState.modulePromise;
}
