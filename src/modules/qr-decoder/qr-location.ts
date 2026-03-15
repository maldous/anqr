import type { Point } from './point';

export interface QRLocation {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
  moduleSize: number;
  moduleCount: number;
}
