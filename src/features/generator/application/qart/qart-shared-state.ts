import type { QArtModule } from './qart-shared-types';

let _qartModulePromise: Promise<QArtModule> | null = null;

export function getQartModulePromise(): Promise<QArtModule> | null {
  return _qartModulePromise;
}

export function setQartModulePromise(p: Promise<QArtModule>): void {
  _qartModulePromise = p;
}

export function loadQArtModule(): Promise<QArtModule> {
  _qartModulePromise ??= import('@/modules/qr-art');
  return _qartModulePromise;
}
