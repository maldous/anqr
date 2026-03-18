export type { AnalyzeMessageCode } from "./analyze-message-code";

export interface AnalyzeMessage {
  code: import("./analyze-message-code").AnalyzeMessageCode;
  params?: Record<string, string | number | boolean | null>;
}
