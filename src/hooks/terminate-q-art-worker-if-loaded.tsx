import { getQartModulePromise } from './qart-module-promise';

export function terminateQArtWorkerIfLoaded(): void {
  const qartPromise = getQartModulePromise();
  if (!qartPromise) return;
  void qartPromise
    .then((qartModule: any) => {
      qartModule.terminateQArtWorker();
    })
    .catch(() => {
      // Ignore termination errors during teardown.
    });
}
