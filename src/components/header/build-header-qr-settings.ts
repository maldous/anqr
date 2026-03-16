import type { StoreState } from "./store-state.type";

export function buildHeaderQrSettings(qr: StoreState["qr"], render: StoreState["render"]) {
  return {
    ec: qr.ecc,
    version: qr.version === 0 ? undefined : qr.version,
    size: render.modulePx === 20 ? undefined : render.modulePx,
    margin: qr.quietZoneModules === 4 ? undefined : qr.quietZoneModules,
    encodingMode: qr.encodingMode === "auto" ? undefined : qr.encodingMode,
    borderModulesExtra: qr.borderModulesExtra === 0 ? undefined : qr.borderModulesExtra,
    quietZoneMinEnforce: qr.quietZoneMinEnforce === false ? false : undefined,
  };
}
