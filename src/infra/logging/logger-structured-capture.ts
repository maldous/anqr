import {
  captureMinLevel,
  captureWhenConsoleEnabled,
  forceStructuredCaptureAll,
} from "./logger-capture-config";
import { LOG_LEVEL_INDEX } from "./logger-level-index";
import type { RuntimeLogLevel } from "./logger-types";

export function shouldCaptureStructured(
  level: Exclude<RuntimeLogLevel, "silent">,
  isConsoleEnabled: boolean,
): boolean {
  if (forceStructuredCaptureAll) return true;
  if (captureWhenConsoleEnabled && isConsoleEnabled) return true;
  return LOG_LEVEL_INDEX[level] >= LOG_LEVEL_INDEX[captureMinLevel];
}
