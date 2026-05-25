import type { QRState } from "../qr-store";

// QR-encoding defaults — extracted from qr-store.ts under L6.
// Typed via lookup on QRState so we don't need to export a sub-type;
// the store's interface remains the single source of truth.
export const DEFAULT_QR: QRState["qr"] = {
  version: 0,
  ecc: "H",
  encodingMode: "auto",
  maskPattern: "auto",
  characterEncoding: "default",
  quietZoneModules: 4,
  quietZoneMinEnforce: true,
  borderModulesExtra: 0,
};
