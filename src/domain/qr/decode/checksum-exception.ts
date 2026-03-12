import { DecoderException } from './decoder-exception';

/**
 * Thrown when checksum verification fails
 */
export class ChecksumException extends DecoderException {
  static readonly kind: string = 'ChecksumException';

  static getChecksumInstance(): ChecksumException {
    return new ChecksumException();
  }
}
