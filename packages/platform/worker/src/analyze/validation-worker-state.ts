import type { ValidationResult } from "@/contracts/analyze";

export const validationWorkerState = {
  worker: null as Worker | null,
  workerFailed: false,
  nextId: 0,
  pending: new Map<number, (result: ValidationResult) => void>(),
};
