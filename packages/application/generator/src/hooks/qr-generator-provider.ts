import type { ReactNode } from "react";
import { createElement } from "react";
import { useQRGenerator } from "./use-qr-generator";
import { QRGeneratorContext } from "./qr-generator-context";

export function QRGeneratorProvider({ children }: Readonly<{ children: ReactNode }>) {
  const value = useQRGenerator();
  return createElement(QRGeneratorContext.Provider, { value }, children);
}
