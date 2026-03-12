export interface CropRegion {
  x: number;
  y: number;
  size: number;
}

export interface CropHandlerOptions {
  container: HTMLElement;
  imageUrl: string;
  initialRegion?: CropRegion;
  minSize?: number;
  onCropChange?: (region: CropRegion) => void;
}
