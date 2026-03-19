import type { AnalyzePlatformRuntime } from "./analyze-platform-runtime.types";

export const analyzePlatformRuntimeState: { current: AnalyzePlatformRuntime | null } = {
  current: null,
};
