import type { UseQRGeneratorResult } from "./hooks-shared-types";
import { useContext } from "react";
import { QRGeneratorContext } from "./qr-generator-context";

export function useQRGeneratorContext(): UseQRGeneratorResult {
  const ctx = useContext(QRGeneratorContext);
  if (!ctx) throw new Error("useQRGeneratorContext must be used within QRGeneratorProvider");
  return ctx;
}
