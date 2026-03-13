import type { QArtModule } from './q-art-module';

let qartModulePromise: Promise<QArtModule> | null = null;

export function getQartModulePromiseState() {
  return qartModulePromise;
}

export function setQartModulePromiseState(value: Promise<QArtModule> | null) {
  qartModulePromise = value;
}
