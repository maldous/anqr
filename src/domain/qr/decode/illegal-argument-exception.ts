import { DecoderException } from './decoder-exception';

/**
 * Thrown for invalid arguments
 */
export class IllegalArgumentException extends DecoderException {
  static readonly kind: string = 'IllegalArgumentException';
}
