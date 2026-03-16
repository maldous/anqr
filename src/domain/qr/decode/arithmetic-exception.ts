import { DecoderException } from "./decoder-exception";

/**
 * Thrown for arithmetic errors (e.g., division by zero in GF)
 */
export class ArithmeticException extends DecoderException {
  static readonly kind: string = "ArithmeticException";
}
