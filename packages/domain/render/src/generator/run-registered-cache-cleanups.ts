import { registeredCleanups } from "./registered-cleanups";

export function runRegisteredCacheCleanups(): void {
  for (const fn of registeredCleanups) fn();
}
