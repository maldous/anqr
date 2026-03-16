import { createHash } from "node:crypto";
import { NON_CACHE_PARAMS } from "./non-cache-params.const.ts";

export function computeCacheKey(params: URLSearchParams): string {
  const entries = [...params.entries()]
    .filter(([k]) => !NON_CACHE_PARAMS.has(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return createHash("sha256").update(new URLSearchParams(entries).toString()).digest("hex");
}
