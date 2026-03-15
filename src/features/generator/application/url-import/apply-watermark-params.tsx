import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

export function applyWatermarkParams(params: Partial<ShareConfig>): void {
  if (params.watermarkEnabled)
    useQRStore.setState((s) => ({ watermark: { ...s.watermark, enabled: true } }));
  if (params.watermarkKind)
    useQRStore.setState((s) => ({
      watermark: { ...s.watermark, kind: params.watermarkKind as any },
    }));
  if (params.watermarkText)
    useQRStore.setState((s) => ({ watermark: { ...s.watermark, text: params.watermarkText! } }));
  if (params.watermarkPosition)
    useQRStore.setState((s) => ({
      watermark: { ...s.watermark, position: params.watermarkPosition as any },
    }));
  if (params.watermarkOpacity !== undefined)
    useQRStore.setState((s) => ({
      watermark: { ...s.watermark, opacity: params.watermarkOpacity! },
    }));
  if (params.watermarkBlend)
    useQRStore.setState((s) => ({
      watermark: { ...s.watermark, blend: params.watermarkBlend as any },
    }));
}
