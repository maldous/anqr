import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';
import { log } from './log-2';

export function applyRenderColorAndPaletteStyles(params: Partial<ShareConfig>): void {
  if (params.perModuleColorMode)
    useQRStore.setState((s) => ({
      render: {
        ...s.render,
        perModuleColorMode: params.perModuleColorMode as
          | 'solid'
          | 'by_brightness'
          | 'by_position'
          | 'by_overlay'
          | 'by_cluster',
      },
    }));
  if (params.contrastGuard)
    useQRStore.setState((s) => ({ render: { ...s.render, contrastGuard: true } }));
  if (params.minContrastRatio !== undefined)
    useQRStore.setState((s) => ({
      render: { ...s.render, minContrastRatio: params.minContrastRatio! },
    }));
  if (params.palette) {
    try {
      let paletteArray: string[];
      if (params.palette.startsWith('[')) {
        paletteArray = JSON.parse(params.palette);
      } else {
        paletteArray = params.palette.split(',').map((c) => (c.startsWith('#') ? c : `#${c}`));
      }
      if (Array.isArray(paletteArray) && paletteArray.length > 0) {
        useQRStore.setState((s) => ({ render: { ...s.render, palette: paletteArray } }));
      }
    } catch (e) {
      log.warn('Failed to parse palette', { error: e });
    }
  }
  if (params.paletteMode)
    useQRStore.setState((s) => ({
      render: { ...s.render, paletteMode: params.paletteMode as any },
    }));
}
