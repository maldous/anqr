import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

export function applySubpixelAndHalftoneParams(params: Partial<ShareConfig>): void {
  if (params.subpixelGridSize)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, subpixelGridSize: params.subpixelGridSize as any },
    }));
  if (params.subpixelCenterRule)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, subpixelCenterRule: params.subpixelCenterRule as any },
    }));
  if (params.subpixelNeutralColor)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, subpixelNeutralColor: params.subpixelNeutralColor! },
    }));
  if (params.subpixelFinderOverride)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, subpixelFinderOverride: params.subpixelFinderOverride as any },
    }));
  if (params.halftoneCell)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, halftoneCell: params.halftoneCell as any },
    }));
  if (params.halftoneDotShape)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, halftoneDotShape: params.halftoneDotShape as any },
    }));
  if (params.brightnessCurve)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, brightnessCurve: params.brightnessCurve as any },
    }));
  if (params.duotoneColor1) {
    const color1 = params.duotoneColor1;
    useQRStore.setState((s) => ({
      overlay: {
        ...s.overlay,
        duotoneColors: [color1, s.overlay.duotoneColors[1]],
      },
    }));
  }
  if (params.duotoneColor2) {
    const color2 = params.duotoneColor2;
    useQRStore.setState((s) => ({
      overlay: {
        ...s.overlay,
        duotoneColors: [s.overlay.duotoneColors[0], color2],
      },
    }));
  }
}
