import { logDebug } from "./logger.mjs";
export function logMemory(label) {
  const mem = process.memoryUsage();
  const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
  const rssMB = Math.round(mem.rss / 1024 / 1024);
  logDebug(`💾 ${label}: heap=${heapMB}MB rss=${rssMB}MB`);
}
