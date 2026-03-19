import type React from "react";
import type { QRAnalysisResult } from "@/contracts/analyze";
import type { AnalysisSourceType } from "./analysis-source.types";

export interface AnalysisStateSetters {
  setIsLoading: (v: boolean) => void;
  setLoadingSource: (v: AnalysisSourceType) => void;
  setAnalysisSource: (v: AnalysisSourceType) => void;
  setError: (v: string | null) => void;
  setResult: (v: QRAnalysisResult | null) => void;
  setImported: (v: boolean) => void;
  setUiTimings: (
    v: React.SetStateAction<{
      encodeMs?: number | null;
      renderMs?: number | null;
      exportMs?: number | null;
    }>,
  ) => void;
  setOriginalImageUrl: (v: React.SetStateAction<string | null>) => void;
}
