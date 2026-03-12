import { DecoderException } from './decoder-exception';

/**
 * Thrown for unsupported operations
 */
export class UnsupportedOperationException extends DecoderException {
  static readonly kind: string = 'UnsupportedOperationException';
}
