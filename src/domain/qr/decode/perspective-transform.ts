/**
 * Perspective transform for quadrilateral to quadrilateral mapping
 */
export class PerspectiveTransform {
  private constructor(
    private readonly a11: number,
    private readonly a21: number,
    private readonly a31: number,
    private readonly a12: number,
    private readonly a22: number,
    private readonly a32: number,
    private readonly a13: number,
    private readonly a23: number,
    private readonly a33: number
  ) {}

  static quadrilateralToQuadrilateral(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x0p: number,
    y0p: number,
    x1p: number,
    y1p: number,
    x2p: number,
    y2p: number,
    x3p: number,
    y3p: number
  ): PerspectiveTransform {
    const qToS = PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    const sToQ = PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return sToQ.times(qToS);
  }

  transformPoints(points: Float32Array): void {
    const { a11, a12, a13, a21, a22, a23, a31, a32, a33 } = this;
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const denominator = a13 * x + a23 * y + a33;
      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  transformPointsWithValues(xValues: Float32Array, yValues: Float32Array): void {
    const { a11, a12, a13, a21, a22, a23, a31, a32, a33 } = this;
    const n = xValues.length;
    for (let i = 0; i < n; i++) {
      const x = xValues[i];
      const y = yValues[i];
      const denominator = a13 * x + a23 * y + a33;
      xValues[i] = (a11 * x + a21 * y + a31) / denominator;
      yValues[i] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  static squareToQuadrilateral(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): PerspectiveTransform {
    const dx3 = x0 - x1 + x2 - x3;
    const dy3 = y0 - y1 + y2 - y3;

    if (dx3 === 0 && dy3 === 0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1);
    } else {
      const dx1 = x1 - x2;
      const dx2 = x3 - x2;
      const dy1 = y1 - y2;
      const dy2 = y3 - y2;
      const denominator = dx1 * dy2 - dx2 * dy1;
      const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(
        x1 - x0 + a13 * x1,
        x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1,
        y3 - y0 + a23 * y3,
        y0,
        a13,
        a23,
        1
      );
    }
  }

  static quadrilateralToSquare(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): PerspectiveTransform {
    return PerspectiveTransform.squareToQuadrilateral(
      x0,
      y0,
      x1,
      y1,
      x2,
      y2,
      x3,
      y3
    ).buildAdjoint();
  }

  protected buildAdjoint(): PerspectiveTransform {
    return new PerspectiveTransform(
      this.a22 * this.a33 - this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21
    );
  }

  protected times(other: PerspectiveTransform): PerspectiveTransform {
    return new PerspectiveTransform(
      this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33
    );
  }
}
