export interface OverlayData {
  size: number;
  brightness: Float32Array;
  colorsPacked?: Uint32Array;
  [row: number]:
    | {
        [col: number]: number;
      }
    | {
        [row: number]: {
          [col: number]: { r: number; g: number; b: number };
        };
      }
    | number
    | Float32Array
    | Uint32Array
    | undefined;
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
}
