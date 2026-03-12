/**
 * Float utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Float {
  static readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;

  static floatToIntBits(f: number): number {
    return f;
  }
}
