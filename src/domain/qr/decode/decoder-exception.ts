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
