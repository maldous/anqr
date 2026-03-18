import type { ShareConfig } from "@/modules/share-links";
import { useQRStore, type SafetyMode, type QRState } from "@/store/qr-store";

export function applySafetyParams(params: Partial<ShareConfig>): void {
  if (params.safetyMode)
    useQRStore.setState((s: QRState) => ({
      safety: { ...s.safety, mode: params.safetyMode as SafetyMode },
    }));
  if (params.safetyMinModulePx !== undefined)
    useQRStore.setState((s: QRState) => ({
      safety: { ...s.safety, minModulePx: params.safetyMinModulePx! },
    }));
  if (params.safetyMinQuietZone !== undefined)
    useQRStore.setState((s: QRState) => ({
      safety: { ...s.safety, minQuietZoneModules: params.safetyMinQuietZone! },
    }));
  if (params.lockFinders === false)
    useQRStore.setState((s: QRState) => ({ safety: { ...s.safety, lockFinders: false } }));
  if (params.lockTiming === false)
    useQRStore.setState((s: QRState) => ({ safety: { ...s.safety, lockTiming: false } }));
  if (params.lockAlign === false)
    useQRStore.setState((s: QRState) => ({ safety: { ...s.safety, lockAlign: false } }));
  if (params.lockFormat === false)
    useQRStore.setState((s: QRState) => ({ safety: { ...s.safety, lockFormat: false } }));
  if (params.lockVersion === false)
    useQRStore.setState((s: QRState) => ({ safety: { ...s.safety, lockVersion: false } }));
}
