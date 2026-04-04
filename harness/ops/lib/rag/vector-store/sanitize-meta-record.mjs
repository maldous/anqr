export function sanitizeMetaRecord(value) {
  const lastModified = Number(value?.lastModified || 0);
  const chunkCount = Number(value?.chunkCount || 0);
  return {
    lastModified: Number.isFinite(lastModified) && lastModified >= 0 ? lastModified : 0,
    chunkCount: Number.isFinite(chunkCount) && chunkCount >= 0 ? chunkCount : 0,
  };
}
