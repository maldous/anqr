import { GifEncoderLike } from './gif-encoder-like';
import { GIFENC } from './gifenc';

export function createGifEncoder(): GifEncoderLike {
  if (!GIFENC.GIFEncoder) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.GIFEncoder();
}
