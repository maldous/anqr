import type { AnalyzePlatformRuntime } from "./analyze-platform-runtime.types";
import { analyzePlatformRuntimeState } from "./analyze-platform-runtime-state";

export function configureAnalyzePlatformRuntime(nextRuntime: AnalyzePlatformRuntime): void {
  analyzePlatformRuntimeState.current = nextRuntime;
}
