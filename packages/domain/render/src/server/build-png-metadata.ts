import type { PngMetadata } from "./png-metadata.types";

export function buildPngMetadata(
  metaTitle: string | undefined,
  metaAuthor: string | undefined,
  metaCopyright: string | undefined,
  metaDescription: string | undefined,
  metaLicense: string | undefined,
  metaCreationTime: boolean,
  metaCustomKv: string | undefined,
): PngMetadata | undefined {
  // B14: parse the URL-encoded custom KV blob (the share-URL pipeline
  // serialises metadata.customKv via JSON.stringify) so each pair lands
  // as its own iTXt chunk in the exported PNG. Previously license was
  // accepted as a param but never emitted; customKv was awkwardly
  // stuffed into description when description was empty.
  let custom: Array<{ k: string; v: string }> | undefined;
  if (metaCustomKv) {
    try {
      const parsed = JSON.parse(metaCustomKv);
      if (Array.isArray(parsed)) {
        custom = parsed
          .filter(
            (p): p is { k: string; v: string } =>
              p && typeof p === "object" && typeof p.k === "string" && typeof p.v === "string",
          )
          .filter((p) => p.k.trim() && p.v);
      }
    } catch {
      // best effort — if the share URL was malformed we just drop custom
    }
  }
  if (
    !metaTitle &&
    !metaAuthor &&
    !metaCopyright &&
    !metaDescription &&
    !metaLicense &&
    !metaCreationTime &&
    !custom?.length
  ) {
    return undefined;
  }
  return {
    title: metaTitle,
    author: metaAuthor,
    copyright: metaCopyright,
    description: metaDescription,
    license: metaLicense,
    creationTime: metaCreationTime ? new Date().toISOString() : undefined,
    software: "ANQR - anqr.link",
    custom,
  };
}
