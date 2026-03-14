import type { ValidationResult } from '../../../domain/qr/analyze/scanner';

export const validationWorkerState = {
  worker: null as Worker | null,
  workerFailed: false,
  nextId: 0,
  pending: new Map<number, (result: ValidationResult) => void>(),
};
