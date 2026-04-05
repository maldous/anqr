import { providerGatewayKey } from "./provider-gateway-key.mjs";

export function shuffleProviderProbeOrder(items) {
  const buckets = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const key = providerGatewayKey(item);
    const bucket = buckets.get(key) || [];
    bucket.push(item);
    buckets.set(key, bucket);
  }
  for (const bucket of buckets.values()) {
    for (let index = bucket.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [bucket[index], bucket[swapIndex]] = [bucket[swapIndex], bucket[index]];
    }
  }
  const keys = [...buckets.keys()];
  for (let index = keys.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [keys[index], keys[swapIndex]] = [keys[swapIndex], keys[index]];
  }
  const ordered = [];
  while (keys.some((key) => (buckets.get(key) || []).length > 0)) {
    for (const key of keys) {
      const bucket = buckets.get(key) || [];
      if (bucket.length > 0) ordered.push(bucket.shift());
    }
  }
  return ordered;
}
