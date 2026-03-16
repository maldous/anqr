import { DecoderException } from "./decoder-exception";

/**
 * Thrown for invalid state
 */
export class IllegalStateException extends DecoderException {
  static readonly kind: string = "IllegalStateException";
}
