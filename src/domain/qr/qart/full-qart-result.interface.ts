export interface FullQArtResult {
  success: boolean;
  error?: string;
  matrix: boolean[][];
  moduleCount: number;
  version: number;
  maskPattern: number;
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  encodedData: string;
  originalData?: string;
  suffix?: string;
}
