import { LuminanceSource } from "./luminance-source";
import { InvertedLuminanceSource } from "./inverted-luminance-source";

/**
 * RGBA luminance source from canvas/ImageData
 */
export class RGBALuminanceSource extends LuminanceSource {
  private readonly luminances: Uint8ClampedArray;

  constructor(luminances: Uint8ClampedArray, width: number, height: number) {
    super(width, height);
    this.luminances = luminances;
  }

  static createFromImageData(imageData: ImageData): RGBALuminanceSource {
    const { data, width, height } = imageData;
    const luminances = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Use standard luminance formula
        luminances[y * width + x] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }
    }
    return new RGBALuminanceSource(luminances, width, height);
  }

  getRow(y: number, row?: Uint8ClampedArray): Uint8ClampedArray {
    const width = this.getWidth();
    if (row === undefined || row === null || row.length < width) {
      row = new Uint8ClampedArray(width);
    }
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      row[x] = this.luminances[offset + x];
    }
    return row;
  }

  getMatrix(): Uint8ClampedArray {
    return this.luminances;
  }

  invert(): LuminanceSource {
    return new InvertedLuminanceSource(this);
  }
}
