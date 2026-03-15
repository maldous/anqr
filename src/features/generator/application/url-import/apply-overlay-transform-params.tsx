import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import type { StoreState } from '@/features/generator/model/mobile-split';

export function applyOverlayTransformParams(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.mode) store.setOverlayMode(params.mode as any);
  if (params.intensity !== undefined) store.setOverlayIntensity(params.intensity);
  if (params.fit) store.setOverlayFit(params.fit as 'cover' | 'contain' | 'stretch');
  if (params.rotate !== undefined) store.setOverlayRotate(params.rotate);
  if (params.flipX) store.setOverlayFlip({ x: true });
  if (params.flipY) store.setOverlayFlip({ y: true });
  if (params.preserveFinders === false) store.setOverlayPreserveFinders(false);
  if (params.preserveTiming) store.setOverlayPreserveTiming(true);
  if (params.preserveAlignment) store.setOverlayPreserveAlignment(true);
  if (params.protectFormatInfo)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, protectFormatInfo: true } }));
  if (params.protectVersionInfo)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, protectVersionInfo: true } }));
}
