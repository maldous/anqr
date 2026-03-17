export interface GifPatchFrame {
  dims: { left: number; top: number; width: number; height: number };
  patch: Uint8Array;
  disposalType: number;
  delay: number;
}
