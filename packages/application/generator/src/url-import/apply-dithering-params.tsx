import type { ShareConfig } from "@/contracts/share";
import type { DiffusionKernel, DitherKind, OrderedMatrix } from "@/contracts/generator";
import type { UrlImportStore } from "./store-contract.types";

export function applyDitheringParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.ditherKind) store.setOverlayDitherKind(params.ditherKind as DitherKind);
  if (params.diffusionKernel)
    store.setOverlayDiffusionKernel(params.diffusionKernel as DiffusionKernel);
  if (params.ditherStrength !== undefined) store.setOverlayDitherStrength(params.ditherStrength);
  if (params.finderDitherStrength !== undefined)
    store.patchState((s) => ({
      overlay: { ...s.overlay, finderDitherStrength: params.finderDitherStrength! },
    }));
  if (params.blendPreservations)
    store.patchState((s) => ({
      overlay: { ...s.overlay, blendPreservations: true },
    }));
  if (params.blendPreservationMode)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        blendPreservationMode: params.blendPreservationMode === "dither" ? "dither" : "overlay",
      },
    }));
  if (params.ditherSerpentine)
    store.patchState((s) => ({ overlay: { ...s.overlay, ditherSerpentine: true } }));
  if (params.orderedMatrix)
    store.patchState((s) => ({
      overlay: { ...s.overlay, orderedMatrix: params.orderedMatrix as OrderedMatrix },
    }));
  if (params.blueNoiseTileSize !== undefined)
    store.patchState((s) => ({
      overlay: { ...s.overlay, blueNoiseTileSize: params.blueNoiseTileSize! },
    }));
  if (params.blueNoiseSeed !== undefined)
    store.patchState((s) => ({
      overlay: { ...s.overlay, blueNoiseSeed: params.blueNoiseSeed! },
    }));
  if (params.colorDither)
    store.patchState((s) => ({
      overlay: {
        ...s.overlay,
        colorDither: params.colorDither as "none" | "per_channel" | "perceptual",
      },
    }));
}
