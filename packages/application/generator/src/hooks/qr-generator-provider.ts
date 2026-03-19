import type { ReactNode } from "react";
import { createElement } from "react";
import { useQRGenerator } from "./use-qr-generator";
import { QRGeneratorContext } from "./qr-generator-context";
import type { UseQRStoreHook } from "./use-qr-store-hook.types";

export function QRGeneratorProvider({
  useStore,
  scheduleTrackEvent,
  children,
}: Readonly<{
  useStore: UseQRStoreHook;
  scheduleTrackEvent: (
    eventName: string,
    payload?: Record<string, string | number | boolean>,
  ) => void;
  children: ReactNode;
}>) {
  const value = useQRGenerator(useStore, scheduleTrackEvent);
  return createElement(QRGeneratorContext.Provider, { value }, children);
}
