import { getQartModulePromise, setQartModulePromise } from "./qart-module-promise";
import type { QArtModule } from "./q-art-module";

export function loadQArtModule(): Promise<QArtModule> {
  if (!getQartModulePromise()) {
    setQartModulePromise(
      Promise.all([import("@/modules/qart"), import("@/platform/worker")]).then(
        ([qartModule, workerModule]) => ({
          ...qartModule,
          generateQArtInWorker: workerModule.generateQArtInWorker,
          terminateQArtWorker: workerModule.terminateQArtWorker,
        }),
      ),
    );
  }
  return getQartModulePromise()!;
}
