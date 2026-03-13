export type ValidateRequest = {
  id: number;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  expectedContent?: string;
  attempts: number;
};
