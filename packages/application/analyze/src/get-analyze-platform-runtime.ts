import type { AnalyzePlatformRuntime } from "./analyze-platform-runtime.types";
import { analyzePlatformRuntimeState } from "./analyze-platform-runtime-state";

export function getAnalyzePlatformRuntime(): AnalyzePlatformRuntime {
  if (!analyzePlatformRuntimeState.current) {
    throw new Error("Analyze platform runtime has not been configured");
  }
  return analyzePlatformRuntimeState.current;
}
