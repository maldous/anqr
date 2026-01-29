/**
 * QR Decoder Exceptions
 * Consolidated exception classes for QR code decoding
 */

/**
 * Base exception class for decoder errors
 */
export class DecoderException extends Error {
  static readonly kind: string = 'DecoderException';

  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }

  getKind(): string {
    return (this.constructor as typeof DecoderException).kind;
  }
}

/**
 * Thrown when a QR code cannot be found in the image
 */
export class NotFoundException extends DecoderException {
  static readonly kind: string = 'NotFoundException';

  static getNotFoundInstance(): NotFoundException {
    return new NotFoundException();
  }
}

/**
 * Thrown when the QR code format is invalid
 */
export class FormatException extends DecoderException {
  static readonly kind: string = 'FormatException';

  static getFormatInstance(): FormatException {
    return new FormatException();
  }
}

/**
 * Thrown when checksum verification fails
 */
export class ChecksumException extends DecoderException {
  static readonly kind: string = 'ChecksumException';

  static getChecksumInstance(): ChecksumException {
    return new ChecksumException();
  }
}

/**
 * Thrown for invalid arguments
 */
export class IllegalArgumentException extends DecoderException {
  static readonly kind: string = 'IllegalArgumentException';
}

/**
 * Thrown for invalid state
 */
export class IllegalStateException extends DecoderException {
  static readonly kind: string = 'IllegalStateException';
}

/**
 * Thrown for arithmetic errors (e.g., division by zero in GF)
 */
export class ArithmeticException extends DecoderException {
  static readonly kind: string = 'ArithmeticException';
}

/**
 * Thrown for Reed-Solomon decoding errors
 */
export class ReedSolomonException extends DecoderException {
  static readonly kind: string = 'ReedSolomonException';
}

/**
 * Thrown for unsupported operations
 */
export class UnsupportedOperationException extends DecoderException {
  static readonly kind: string = 'UnsupportedOperationException';
}

/**
 * Thrown for array index out of bounds
 */
export class ArrayIndexOutOfBoundsException extends DecoderException {
  static readonly kind: string = 'ArrayIndexOutOfBoundsException';

  constructor(index?: number | string) {
    super(typeof index === 'number' ? `Index: ${index}` : index);
  }
}
