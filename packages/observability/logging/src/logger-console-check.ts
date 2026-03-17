import type loglevel from "loglevel";
import { getLoglevelInstance } from "./logger-loglevel-instance";
import { LOG_LEVEL_INDEX } from "./logger-level-index";
import type { RuntimeLogLevel } from "./logger-types";

export function isLevelEnabledForLogger(
  logger: loglevel.Logger,
  level: Exclude<RuntimeLogLevel, "silent">,
): boolean {
  const maybeGetter = (logger as unknown as { getLevel?: () => number }).getLevel;
  const loggerLevel =
    typeof maybeGetter === "function" ? maybeGetter.call(logger) : getLoglevelInstance().getLevel();
  return LOG_LEVEL_INDEX[level] >= loggerLevel;
}
