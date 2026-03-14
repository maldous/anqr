import { createLogger } from '../../../infra/logging/logger';
import type { DecodeResult } from '../../../modules/qr-decoder/types';
import { GlobalHistogramBinarizer } from './binarizer';
import { NotFoundException } from './exceptions';
import { createLuminanceSource } from './create-luminance-source';
import { extractDecodeResult } from './extract-decode-result';
import { invertImageData } from './invert-image-data';
import { BinaryBitmap } from './luminance';
import { Reader } from './reader';
import { DecodeHintType } from './result-types';

const qrDecoderLog = createLogger('DECODER');

export function tryDecodeWithGlobalBinarizer(
  imageData: ImageData,
  invert: boolean,
  hints?: Map<DecodeHintType, any>
): DecodeResult | null {
  try {
    const source = createLuminanceSource(invert ? invertImageData(imageData) : imageData);
    const binarizer = new GlobalHistogramBinarizer(source);
    const bitmap = new BinaryBitmap(binarizer);
    const reader = new Reader();
    const result = reader.decode(bitmap, hints);
    qrDecoderLog.trace('decoder: GlobalHistogramBinarizer decode succeeded');
    return extractDecodeResult(result, imageData);
  } catch (err) {
    if (err instanceof NotFoundException) {
      qrDecoderLog.trace('decoder: GlobalHistogramBinarizer NotFoundException', { invert });
    } else {
      qrDecoderLog.trace('decoder: GlobalHistogramBinarizer Error', { error: String(err), invert });
    }
    return null;
  }
}
