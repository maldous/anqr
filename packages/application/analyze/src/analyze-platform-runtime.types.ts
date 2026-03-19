export interface AnalyzePlatformRuntime {
  saveFileNative: (filename: string, blob: Blob) => Promise<boolean>;
}
