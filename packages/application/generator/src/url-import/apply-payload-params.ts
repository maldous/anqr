import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore, UrlImportTier } from "./store-contract.types";

export function applyTierAndPayloadParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  let requiredTier: UrlImportTier = "basic";
  if (params.mode || params.overlayUrl || params.intensity !== undefined) {
    requiredTier = "advanced";
  }
  if (params.style && params.style !== "square") {
    requiredTier = "advanced";
  }
  if (params.finder && params.finder !== "square") {
    requiredTier = "advanced";
  }
  if (params.fg && params.fg !== "#000000") {
    requiredTier = "advanced";
  }
  if (params.bg && params.bg !== "#ffffff") {
    requiredTier = "advanced";
  }
  if (requiredTier !== "basic") {
    store.setTier(requiredTier);
  }

  if (params.data) {
    const data = params.data;
    if (data.startsWith("http://") || data.startsWith("https://")) {
      store.setPayloadKind("url");
      store.setPayloadUrl({ href: data });
      store.setPayloadText(data);
    } else {
      store.setPayloadKind("plain_text");
      store.setPayloadText(data);
    }
  }
}
