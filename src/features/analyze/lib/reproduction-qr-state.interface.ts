export interface ReproductionQrState {
  version: number;
  maskPattern: 'auto' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  encodingMode: string;
  borderModulesExtra?: number;
}
