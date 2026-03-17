/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Terminate QArt worker if loaded.
 */

import { getQartModulePromise } from "./qart-shared.types";

export function terminateQArtWorkerIfLoaded(): void {
  const qartPromise = getQartModulePromise();
  if (!qartPromise) return;
  void qartPromise
    .then((qartModule) => {
      qartModule.terminateQArtWorker();
    })
    .catch(() => {
      // Ignore termination errors during teardown.
    });
}
