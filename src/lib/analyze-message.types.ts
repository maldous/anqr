import type { AnalyzeMessageCode } from "./analyze-message-code";

export interface AnalyzeMessage {
  code: AnalyzeMessageCode;
  params?: Record<string, string | number | boolean | null>;
}
