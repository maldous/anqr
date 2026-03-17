import type { CropRegion } from "./crop-region";

export interface CropHandlerOptions {
  container: HTMLElement;
  imageUrl: string;
  initialRegion?: CropRegion;
  minSize?: number;
  onCropChange?: (region: CropRegion) => void;
}
