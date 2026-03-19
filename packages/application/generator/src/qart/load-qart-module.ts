import type { QArtModule } from "./qart-shared-types";
import { qartSharedState } from "./qart-shared-state-store";

export function loadQArtModule(): Promise<QArtModule> {
  qartSharedState.modulePromise ??= Promise.all([
    import("@/domain/qr/qart"),
    import("@/platform/worker"),
  ]).then(([qartModule, workerModule]) => ({
    ...qartModule,
    generateQArtInWorker: workerModule.generateQArtInWorker,
    terminateQArtWorker: workerModule.terminateQArtWorker,
  }));
  return qartSharedState.modulePromise;
}
