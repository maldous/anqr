import type { ShareConfig } from "@/modules/share-links";
import { useQRStore } from "@/store/qr-store";
import type { StoreState } from "@/features/generator/model/mobile-split";

export function applyOutputBasicParams(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.format) store.setOutputFormat(params.format as "png" | "webp" | "gif" | "svg");
  if (params.width !== undefined) store.setOutputWidth(params.width);
  if (params.height !== undefined) store.setOutputHeight(params.height);
  if (params.quality !== undefined) store.setOutputQuality(params.quality);
  if (params.filename) store.setOutputFilename(params.filename);
  if (params.gifPaletteSize !== undefined) store.setOutputGifPaletteSize(params.gifPaletteSize);
  if (params.gifQuantizer)
    store.setOutputGifQuantizer(params.gifQuantizer as "median_cut" | "neuquant" | "octree");
  if (params.gifDither)
    useQRStore.setState((s) => ({
      output: { ...s.output, gifDither: params.gifDither as typeof s.output.gifDither },
    }));
}
