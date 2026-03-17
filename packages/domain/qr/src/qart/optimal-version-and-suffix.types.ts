export interface OptimalVersionAndSuffix {
  version: number;
  suffixLength: number;
  totalCapacity: number;
  expectedControlPercent: number;
  versionUpgraded: boolean;
  originalVersion: number;
  paddingBytes: number;
  suffixBits: number;
  paddingBits: number;
}
