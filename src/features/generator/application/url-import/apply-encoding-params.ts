import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import type { StoreState } from '@/features/generator/model/mobile-split';

export function applyQrEncodingParams(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.ec) store.setQrEcc(params.ec as 'L' | 'M' | 'Q' | 'H');
  if (params.version) store.setQrVersion(params.version);
  if (params.size) store.setRenderModulePx(params.size);
  if (params.margin !== undefined) store.setQrQuietZone(params.margin);
  if (params.encodingMode)
    store.setQrEncodingMode(
      params.encodingMode as 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji'
    );
  if (params.borderModulesExtra !== undefined)
    useQRStore.setState((s) => ({
      qr: { ...s.qr, borderModulesExtra: params.borderModulesExtra! },
    }));
  if (params.quietZoneMinEnforce === false)
    useQRStore.setState((s) => ({ qr: { ...s.qr, quietZoneMinEnforce: false } }));
}
