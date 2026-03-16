import { UnsupportedOperationException } from "./exceptions";
import { StringBuilder } from "./util";

/**
 * Abstract luminance source for grayscale image data
 */
export abstract class LuminanceSource {
  protected constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  abstract getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray;
  abstract getMatrix(): Uint8ClampedArray;
  abstract invert(): LuminanceSource;

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  isCropSupported(): boolean {
    return false;
  }

  crop(_left: number, _top: number, _width: number, _height: number): LuminanceSource {
    throw new UnsupportedOperationException("This luminance source does not support cropping.");
  }

  isRotateSupported(): boolean {
    return false;
  }

  rotateCounterClockwise(): LuminanceSource {
    throw new UnsupportedOperationException(
      "This luminance source does not support rotation by 90 degrees.",
    );
  }

  rotateCounterClockwise45(): LuminanceSource {
    throw new UnsupportedOperationException(
      "This luminance source does not support rotation by 45 degrees.",
    );
  }

  toString(): string {
    const row = new Uint8ClampedArray(this.width);
    const result = new StringBuilder();
    for (let y = 0; y < this.height; y++) {
      const sourceRow = this.getRow(y, row);
      for (let x = 0; x < this.width; x++) {
        const luminance = sourceRow[x] & 0xff;
        let c: string;
        if (luminance < 0x40) c = "#";
        else if (luminance < 0x80) c = "+";
        else if (luminance < 0xc0) c = ".";
        else c = " ";
        result.append(c);
      }
      result.append("\n");
    }
    return result.toString();
  }
}
