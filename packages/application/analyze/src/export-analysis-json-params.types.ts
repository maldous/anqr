import type React from "react";
import type { QRAnalysisResult } from "@/modules/qr-analyzer";
import type { AnalysisSourceType } from "./analysis-source.types";

export interface ExportAnalysisJSONParams {
  result: QRAnalysisResult;
  uiTimings: { encodeMs?: number | null; renderMs?: number | null; exportMs?: number | null };
  analysisSource: AnalysisSourceType;
  actualUsedVersion: number | null;
  setUiTimings: React.Dispatch<
    React.SetStateAction<{
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    }>
  >;
}
