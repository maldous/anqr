import type { OutputFormat } from "./output-format";

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: OutputFormat;
  width: number;
  height: number;
}
