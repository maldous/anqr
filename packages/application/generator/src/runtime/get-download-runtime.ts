import type { DownloadRuntime } from "./generator-runtime.types";
import { requireGeneratorRuntime } from "./require-generator-runtime";

export function getDownloadRuntime(): DownloadRuntime {
  return requireGeneratorRuntime().download;
}
