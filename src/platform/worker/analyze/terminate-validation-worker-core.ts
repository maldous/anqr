import { validationWorkerState } from './validation-worker-state';

export function terminateValidationWorker(): void {
  if (validationWorkerState.worker) {
    validationWorkerState.worker.terminate();
    validationWorkerState.worker = null;
  }

  for (const [id, resolve] of validationWorkerState.pending) {
    validationWorkerState.pending.delete(id);
    resolve({ valid: false, error: 'Worker terminated', confidence: 'low' });
  }
}
