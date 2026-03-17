import * as gifencNs from "gifenc";
import type { GifEncoderFactory } from "./gif-encoder-factory";
import type { QuantizeFn } from "./quantize-fn";
import type { ApplyPaletteFn } from "./apply-palette-fn";

export function resolveGifEnc() {
  const ns = gifencNs as {
    GIFEncoder?: GifEncoderFactory;
    quantize?: QuantizeFn;
    applyPalette?: ApplyPaletteFn;
    default?: {
      GIFEncoder?: GifEncoderFactory;
      quantize?: QuantizeFn;
      applyPalette?: ApplyPaletteFn;
    };
  };
  return {
    GIFEncoder: ns.GIFEncoder ?? ns.default?.GIFEncoder,
    quantize: ns.quantize ?? ns.default?.quantize,
    applyPalette: ns.applyPalette ?? ns.default?.applyPalette,
  };
}
