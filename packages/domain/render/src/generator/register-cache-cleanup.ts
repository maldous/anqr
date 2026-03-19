import { registeredCleanups } from "./registered-cleanups";

export function registerCacheCleanup(fn: () => void): void {
  registeredCleanups.push(fn);
}
