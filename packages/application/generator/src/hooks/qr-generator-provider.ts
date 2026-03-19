import type { ReactNode } from "react";
import { createElement } from "react";
import { useQRGenerator } from "./use-qr-generator";
import { QRGeneratorContext } from "./qr-generator-context";
import type { UseQRStoreHook } from "./use-qr-store-hook.types";

export function QRGeneratorProvider({
  useStore,
  children,
}: Readonly<{ useStore: UseQRStoreHook; children: ReactNode }>) {
  const value = useQRGenerator(useStore);
  return createElement(QRGeneratorContext.Provider, { value }, children);
}
