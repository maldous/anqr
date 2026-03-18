import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type QRState } from "@/store/qr-store";
import { log } from "./log";

export function applyMetadataParams(params: Partial<ShareConfig>): void {
  if (params.metaTitle)
    useQRStore.setState((s: QRState) => ({ metadata: { ...s.metadata, title: params.metaTitle! } }));
  if (params.metaAuthor)
    useQRStore.setState((s: QRState) => ({ metadata: { ...s.metadata, author: params.metaAuthor! } }));
  if (params.metaCopyright)
    useQRStore.setState((s: QRState) => ({
      metadata: { ...s.metadata, copyright: params.metaCopyright! },
    }));
  if (params.metaLicense)
    useQRStore.setState((s: QRState) => ({ metadata: { ...s.metadata, license: params.metaLicense! } }));
  if (params.metaDescription)
    useQRStore.setState((s: QRState) => ({
      metadata: { ...s.metadata, description: params.metaDescription! },
    }));
  if (params.metaCreationTime)
    useQRStore.setState((s: QRState) => ({ metadata: { ...s.metadata, creationTime: true } }));
  if (params.metaCustomKv) {
    try {
      const customKv = JSON.parse(params.metaCustomKv);
      if (Array.isArray(customKv)) {
        useQRStore.setState((s: QRState) => ({ metadata: { ...s.metadata, customKv } }));
      }
    } catch (e) {
      log.warn("Failed to parse custom metadata", { error: e });
    }
  }
}
