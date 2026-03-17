import type { QRAnalysisResult } from "./types";

export interface AnalysisExportGeneratorSettings {
  text?: string;
  ecc?: QRAnalysisResult["eccLevel"];
  version?: number | null;
  maskPattern?: number | null;
  encodingMode?: "numeric" | "alphanumeric" | "byte" | "kanji";
  fgColor?: string;
  bgColor?: string;
}
