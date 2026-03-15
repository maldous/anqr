import { DecoderException } from './decoder-exception';

/**
 * Thrown when a QR code cannot be found in the image
 */
export class NotFoundException extends DecoderException {
  static readonly kind: string = 'NotFoundException';

  static getNotFoundInstance(): NotFoundException {
    return new NotFoundException();
  }
}
