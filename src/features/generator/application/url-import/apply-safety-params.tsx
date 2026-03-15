import type { ShareConfig } from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

export function applySafetyParams(params: Partial<ShareConfig>): void {
  if (params.safetyMode)
    useQRStore.setState((s) => ({ safety: { ...s.safety, mode: params.safetyMode as any } }));
  if (params.safetyMinModulePx !== undefined)
    useQRStore.setState((s) => ({
      safety: { ...s.safety, minModulePx: params.safetyMinModulePx! },
    }));
  if (params.safetyMinQuietZone !== undefined)
    useQRStore.setState((s) => ({
      safety: { ...s.safety, minQuietZoneModules: params.safetyMinQuietZone! },
    }));
  if (params.lockFinders === false)
    useQRStore.setState((s) => ({ safety: { ...s.safety, lockFinders: false } }));
  if (params.lockTiming === false)
    useQRStore.setState((s) => ({ safety: { ...s.safety, lockTiming: false } }));
  if (params.lockAlign === false)
    useQRStore.setState((s) => ({ safety: { ...s.safety, lockAlign: false } }));
  if (params.lockFormat === false)
    useQRStore.setState((s) => ({ safety: { ...s.safety, lockFormat: false } }));
  if (params.lockVersion === false)
    useQRStore.setState((s) => ({ safety: { ...s.safety, lockVersion: false } }));
}
