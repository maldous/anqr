// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:35

export function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
