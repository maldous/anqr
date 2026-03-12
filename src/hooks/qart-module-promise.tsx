import type { QArtModule } from './q-art-module';

let qartModulePromise: Promise<QArtModule> | null = null;
export function getQartModulePromise() { return qartModulePromise; }
export function setQartModulePromise(v: Promise<QArtModule> | null) { qartModulePromise = v; }
