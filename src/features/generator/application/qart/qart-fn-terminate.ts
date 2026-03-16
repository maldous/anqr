/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Terminate QArt worker if loaded.
 */

import { getQartModulePromise } from "@/features/generator/application/qart/qart-shared-state";

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
