import { DecoderException } from './decoder-exception';

/**
 * Thrown when the QR code format is invalid
 */
export class FormatException extends DecoderException {
  static readonly kind: string = 'FormatException';

  static getFormatInstance(): FormatException {
    return new FormatException();
  }
}
