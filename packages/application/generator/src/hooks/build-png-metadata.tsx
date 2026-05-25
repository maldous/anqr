export function buildPngMetadata(metadataState: {
  title: string;
  author: string;
  copyright: string;
  license: string;
  description: string;
  creationTime: boolean;
  customKv: Array<{ k: string; v: string }>;
}): Record<string, string | undefined> | undefined {
  const hasCustom = metadataState.customKv.some((kv) => kv.k.trim() && kv.v);
  if (
    !metadataState.title &&
    !metadataState.author &&
    !metadataState.copyright &&
    !metadataState.license &&
    !metadataState.description &&
    !hasCustom
  ) {
    return undefined;
  }
  // B14: license + customKv reached this builder via the store but were
  // dropped before the PNG embedder. license now emits as a standard
  // PNG text chunk; customKv pairs are flattened with a `custom:` prefix
  // so embed-png-metadata.tsx's keywordMap fallback turns each into its
  // own iTXt chunk.
  const out: Record<string, string | undefined> = {
    title: metadataState.title || undefined,
    author: metadataState.author || undefined,
    copyright: metadataState.copyright || undefined,
    license: metadataState.license || undefined,
    description: metadataState.description || undefined,
    creationTime: metadataState.creationTime ? new Date().toISOString() : undefined,
    software: "ANQR - https://anqr.link",
  };
  // PNG iTXt keywords must be 1-79 ASCII chars, no leading/trailing
  // whitespace, no control chars. Sanitise the user-supplied keys.
  for (const { k, v } of metadataState.customKv) {
    const key = k
      .trim()
      .replace(/[^\x20-\x7e]/g, "") // strip non-printable
      .slice(0, 79);
    if (!key || !v) continue;
    out[key] = v;
  }
  return out;
}
