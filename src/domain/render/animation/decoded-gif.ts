import type { GifPatchFrame } from './gif-patch-frame';

export interface DecodedGif {
  width: number;
  height: number;
  frames: GifPatchFrame[];
}
