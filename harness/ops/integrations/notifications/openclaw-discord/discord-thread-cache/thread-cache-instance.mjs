import { createDurableMap } from "../../../../lib/durable-kv.mjs";

export const threadCache = createDurableMap("discord-thread-cache");
export const CACHE_TTL_MS = 30 * 60 * 1000;
