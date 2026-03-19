import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";
import { log } from "./log";

export function applyMetadataParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.metaTitle)
    store.patchState((s) => ({
      metadata: { ...s.metadata, title: params.metaTitle! },
    }));
  if (params.metaAuthor)
    store.patchState((s) => ({
      metadata: { ...s.metadata, author: params.metaAuthor! },
    }));
  if (params.metaCopyright)
    store.patchState((s) => ({
      metadata: { ...s.metadata, copyright: params.metaCopyright! },
    }));
  if (params.metaLicense)
    store.patchState((s) => ({
      metadata: { ...s.metadata, license: params.metaLicense! },
    }));
  if (params.metaDescription)
    store.patchState((s) => ({
      metadata: { ...s.metadata, description: params.metaDescription! },
    }));
  if (params.metaCreationTime)
    store.patchState((s) => ({ metadata: { ...s.metadata, creationTime: true } }));
  if (params.metaCustomKv) {
    try {
      const customKv = JSON.parse(params.metaCustomKv);
      if (Array.isArray(customKv)) {
        store.patchState((s) => ({ metadata: { ...s.metadata, customKv } }));
      }
    } catch (e) {
      log.warn("Failed to parse custom metadata", { error: e });
    }
  }
}
