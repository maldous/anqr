import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type QRState } from "@/store/qr-store";

export function applyOutputAdvancedParams(params: Partial<ShareConfig>): void {
  if (params.svgTrueVector) useQRStore.getState().setOutputSvgTrueVector(true);
  if (params.dpi !== undefined)
    useQRStore.setState((s: QRState) => ({ output: { ...s.output, dpi: params.dpi! } }));
  if (params.includeQuietZone === false)
    useQRStore.setState((s: QRState) => ({ output: { ...s.output, includeQuietZone: false } }));
  if (params.bgOverride)
    useQRStore.setState((s: QRState) => ({ output: { ...s.output, bgOverride: params.bgOverride! } }));
  if (params.gifTransparentColor)
    useQRStore.setState((s: QRState) => ({
      output: { ...s.output, gifTransparentColor: params.gifTransparentColor! },
    }));
  if (params.svgShapePrecision)
    useQRStore.setState((s: QRState) => ({
      output: { ...s.output, svgShapePrecision: params.svgShapePrecision as "pixel" | "precise" },
    }));
  if (params.svgEmbedRasterOverlay === false)
    useQRStore.setState((s: QRState) => ({ output: { ...s.output, svgEmbedRasterOverlay: false } }));
  if (params.formatExtra)
    useQRStore.setState((s: QRState) => ({
      output: { ...s.output, formatExtra: params.formatExtra as "none" | "eps" | "animated_webp" },
    }));
}
