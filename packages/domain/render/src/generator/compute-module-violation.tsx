import type { ModuleViolation } from "./module-violation";

export function computeModuleViolation(
  qrIsDark: boolean,
  occ: number,
  cOcc: number,
  darkMin: number,
  lightMax: number,
  darkCenterMin: number,
  lightCenterMax: number,
): ModuleViolation | null {
  let occViolation = 0;
  let centerViolation = 0;
  let toDark = false;
  if (qrIsDark && occ < darkMin) {
    occViolation = darkMin - occ;
    toDark = true;
  } else if (!qrIsDark && occ > lightMax) {
    occViolation = occ - lightMax;
  }
  if (qrIsDark && cOcc < darkCenterMin) {
    centerViolation = darkCenterMin - cOcc;
    toDark = true;
  } else if (!qrIsDark && cOcc > lightCenterMax) {
    centerViolation = cOcc - lightCenterMax;
    toDark = false;
  }
  if (occViolation <= 0 && centerViolation <= 0) return null;
  return { occViolation, centerViolation, toDark };
}
