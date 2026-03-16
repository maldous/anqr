import { DecoderException } from "./decoder-exception";

/**
 * Thrown for Reed-Solomon decoding errors
 */
export class ReedSolomonException extends DecoderException {
  static readonly kind: string = "ReedSolomonException";
}
