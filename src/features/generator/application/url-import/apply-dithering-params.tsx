import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import type { StoreState } from '@/features/generator/model/mobile-split';

export function applyDitheringParams(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.ditherKind) store.setOverlayDitherKind(params.ditherKind as any);
  if (params.diffusionKernel) store.setOverlayDiffusionKernel(params.diffusionKernel as any);
  if (params.ditherStrength !== undefined) store.setOverlayDitherStrength(params.ditherStrength);
  if (params.finderDitherStrength !== undefined)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, finderDitherStrength: params.finderDitherStrength! },
    }));
  if (params.blendPreservations)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, blendPreservations: true },
    }));
  if (params.blendPreservationMode)
    useQRStore.setState((s) => ({
      overlay: {
        ...s.overlay,
        blendPreservationMode: params.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
      },
    }));
  if (params.ditherSerpentine)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, ditherSerpentine: true } }));
  if (params.orderedMatrix)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, orderedMatrix: params.orderedMatrix as any },
    }));
  if (params.blueNoiseTileSize !== undefined)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, blueNoiseTileSize: params.blueNoiseTileSize! },
    }));
  if (params.blueNoiseSeed !== undefined)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, blueNoiseSeed: params.blueNoiseSeed! },
    }));
  if (params.colorDither)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, colorDither: params.colorDither as any },
    }));
}
