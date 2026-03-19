import { useQRGenerator } from "@/application/generator";
import { useQRStore } from "../../../state/qr-store";
import { createElement, type ReactNode } from "react";
import { QRGeneratorContext } from "./qr-generator-context";

export function QRGeneratorProvider({ children }: Readonly<{ children: ReactNode }>) {
  const value = useQRGenerator(useQRStore);
  return createElement(QRGeneratorContext.Provider, { value }, children);
}
