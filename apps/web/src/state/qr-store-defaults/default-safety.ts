import type { QRState } from "../qr-store";

export const DEFAULT_SAFETY: QRState["safety"] = {
  mode: "off",
  minModulePx: 2,
  minQuietZoneModules: 4,
  lockFinders: true,
  lockTiming: true,
  lockAlign: true,
  lockFormat: true,
  lockVersion: true,
  maxOverlayIntensityByEcc: { L: 30, M: 50, Q: 70, H: 85 },
};
