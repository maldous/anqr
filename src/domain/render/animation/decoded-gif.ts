import type { GifPatchFrame } from './gif-codec.types';

export interface DecodedGif {
  width: number;
  height: number;
  frames: GifPatchFrame[];
}
