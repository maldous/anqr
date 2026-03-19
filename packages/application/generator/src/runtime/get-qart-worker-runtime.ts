import type { QArtWorkerRuntime } from "./generator-runtime.types";
import { requireGeneratorRuntime } from "./require-generator-runtime";

export function getQArtWorkerRuntime(): QArtWorkerRuntime {
  return requireGeneratorRuntime().qartWorker;
}
