import { DecoderException } from './decoder-exception';

/**
 * Thrown for array index out of bounds
 */
export class ArrayIndexOutOfBoundsException extends DecoderException {
  static readonly kind: string = 'ArrayIndexOutOfBoundsException';

  constructor(index?: number | string) {
    super(typeof index === 'number' ? `Index: ${index}` : index);
  }
}
