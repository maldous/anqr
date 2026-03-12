export interface GifPatchFrame {
  dims: { left: number; top: number; width: number; height: number };
  patch: Uint8Array;
  disposalType: number;
  delay: number; // milliseconds (gifuct-js converts centiseconds internally)
}

export interface DecodedGif {
  width: number;
  height: number;
  frames: GifPatchFrame[];
}
