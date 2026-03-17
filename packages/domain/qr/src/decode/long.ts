/**
 * Long utility functions
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Ported from ZXing Java library, maintaining original structure
export class Long {
  static parseLong(num: string, radix?: number): number {
    return Number.parseInt(num, radix);
  }
}
