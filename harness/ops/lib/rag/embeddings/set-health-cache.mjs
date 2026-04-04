import { healthCache } from "./health-cache.mjs";

export function setHealthCache(newState) {
  Object.assign(healthCache, newState);
}
