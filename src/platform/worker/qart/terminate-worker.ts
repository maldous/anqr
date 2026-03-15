import { failAllPending } from './fail-all-pending';
import { workerClientState } from './worker-client-state';

export function terminateQArtWorker(): void {
  if (workerClientState.worker) {
    workerClientState.worker.terminate();
    workerClientState.worker = null;
  }

  failAllPending(new Error('QArt worker terminated'));
}
