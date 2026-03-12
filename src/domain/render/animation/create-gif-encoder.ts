import { GifEncoderLike, GIFENC } from './gif-codec._internal';

export function createGifEncoder(): GifEncoderLike {
  if (!GIFENC.GIFEncoder) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  return GIFENC.GIFEncoder();
}
