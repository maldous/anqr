import type { StoreState } from "./share-config-store.types";

export function buildShareMetadataFields(metadata: StoreState["metadata"]) {
  return {
    metaTitle: metadata.title || undefined,
    metaAuthor: metadata.author || undefined,
    metaCopyright: metadata.copyright || undefined,
    metaLicense: metadata.license || undefined,
    metaDescription: metadata.description || undefined,
    metaCreationTime: metadata.creationTime ? true : undefined,
    metaCustomKv: metadata.customKv.length > 0 ? JSON.stringify(metadata.customKv) : undefined,
  };
}
