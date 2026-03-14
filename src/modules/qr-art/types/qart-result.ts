export interface QArtResult {
  success: boolean;
  error?: string;
  matrix?: boolean[][];
  matchingPixels: number;
  totalControllable: number;
  matchPercentage: number;
  modifiedData?: string;
  segments?: Array<{ data: string; mode: string }>;
}
