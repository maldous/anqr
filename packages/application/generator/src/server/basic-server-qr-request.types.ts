import type { OutputFormat } from "@/contracts/generator";

export interface BasicServerQRRequest {
  data: string;
  size?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
  foreground?: string;
  background?: string;
  format?: Extract<OutputFormat, "png" | "svg">;
  margin?: number;
}
