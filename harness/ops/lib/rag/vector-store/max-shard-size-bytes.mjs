export const MAX_SHARD_SIZE_BYTES = Number(
  process.env.RAG_MAX_SHARD_SIZE_BYTES || 50 * 1024 * 1024,
);
