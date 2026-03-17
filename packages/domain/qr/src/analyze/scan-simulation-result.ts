export interface ScanSimulationResult {
  success: boolean;
  data: string | null;
  confidence: number;
  conditions: string;
}
