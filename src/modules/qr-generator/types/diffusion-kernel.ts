export interface DiffusionKernel {
  offsets: Array<{ dx: number; dy: number; weight: number }>;
  divisor: number;
}
