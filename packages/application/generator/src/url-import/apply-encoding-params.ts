import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";

export function applyQrEncodingParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.ec) store.setQrEcc(params.ec as "L" | "M" | "Q" | "H");
  if (params.version) store.setQrVersion(params.version);
  if (params.size) store.setRenderModulePx(params.size);
  if (params.margin !== undefined) store.setQrQuietZone(params.margin);
  if (params.encodingMode)
    store.setQrEncodingMode(
      params.encodingMode as "auto" | "numeric" | "alphanumeric" | "byte" | "kanji",
    );
  if (params.borderModulesExtra !== undefined)
    store.patchState((s) => ({
      qr: { ...s.qr, borderModulesExtra: params.borderModulesExtra! },
    }));
  if (params.quietZoneMinEnforce === false)
    store.patchState((s) => ({ qr: { ...s.qr, quietZoneMinEnforce: false } }));
}
