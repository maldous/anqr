import type { ShareConfig } from "@/modules/share-links";
import type { UrlImportStore } from "./store-contract.types";

export function applyOutputBasicParams(params: Partial<ShareConfig>, store: UrlImportStore): void {
  if (params.format) store.setOutputFormat(params.format as "png" | "webp" | "gif" | "svg");
  if (params.width !== undefined) store.setOutputWidth(params.width);
  if (params.height !== undefined) store.setOutputHeight(params.height);
  if (params.quality !== undefined) store.setOutputQuality(params.quality);
  if (params.filename) store.setOutputFilename(params.filename);
  if (params.gifPaletteSize !== undefined) store.setOutputGifPaletteSize(params.gifPaletteSize);
  if (params.gifQuantizer)
    store.setOutputGifQuantizer(params.gifQuantizer as "median_cut" | "neuquant" | "octree");
  if (params.gifDither)
    store.patchState((s) => ({
      output: { ...s.output, gifDither: params.gifDither as typeof s.output.gifDither },
    }));
}
