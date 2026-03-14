import { terminateQArtWorker as terminateQArtWorkerCore } from './terminate-worker';

export function terminateQArtWorker(): void {
  return terminateQArtWorkerCore();
}
