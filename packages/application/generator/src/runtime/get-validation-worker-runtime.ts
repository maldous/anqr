import type { ValidationWorkerRuntime } from "./generator-runtime.types";
import { requireGeneratorRuntime } from "./require-generator-runtime";

export function getValidationWorkerRuntime(): ValidationWorkerRuntime {
  return requireGeneratorRuntime().validationWorker;
}
