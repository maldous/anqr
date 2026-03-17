export interface QRCodeInstance {
  addData: (data: string, mode?: string) => void;
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
  make: (maskPattern?: number) => void;
  createTableTag: (cellSize?: number, margin?: number) => string;
  createSvgTag: (cellSize?: number, margin?: number, alt?: unknown, title?: unknown) => string;
  createDataURL: (cellSize?: number, margin?: number) => string;
  createImgTag: (cellSize?: number, margin?: number, alt?: string) => string;
  createASCII: (cellSize?: number, margin?: number) => string;
  renderTo2dContext: (context: CanvasRenderingContext2D, cellSize?: number) => void;
  getDataCache?: () => number[];
}
