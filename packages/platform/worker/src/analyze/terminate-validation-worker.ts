import { terminateValidationWorker as terminateValidationWorkerCore } from "./terminate-validation-worker-core";

export function terminateValidationWorker(): void {
  return terminateValidationWorkerCore();
}
