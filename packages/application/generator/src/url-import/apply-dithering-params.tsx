import type { ShareConfig } from "@/modules/share-links";
import {
  useQRStore,
  type DitherKind,
  type DiffusionKernel,
  type OrderedMatrix,
} from "@/store/qr-store";
import type { UrlImportStore } from "./store-contract.types";

export function applyDitheringParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.ditherKind) store.setOverlayDitherKind(params.ditherKind as DitherKind);
  if (params.diffusionKernel)
    store.setOverlayDiffusionKernel(params.diffusionKernel as DiffusionKernel);
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
        blendPreservationMode: params.blendPreservationMode === "dither" ? "dither" : "overlay",
      },
    }));
  if (params.ditherSerpentine)
    useQRStore.setState((s) => ({ overlay: { ...s.overlay, ditherSerpentine: true } }));
  if (params.orderedMatrix)
    useQRStore.setState((s) => ({
      overlay: { ...s.overlay, orderedMatrix: params.orderedMatrix as OrderedMatrix },
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
      overlay: {
        ...s.overlay,
        colorDither: params.colorDither as "none" | "per_channel" | "perceptual",
      },
    }));
}
