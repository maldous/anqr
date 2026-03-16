import { MIN_QART_VERSION } from "./rs-basis";
import { log } from "./log";

export function resolveQArtVersion(
  forceVersion: number | undefined,
  version: number,
): { versionToUse: number; versionWasUpgradedForQArt: boolean } {
  let versionWasUpgradedForQArt = false;
  let versionToUse: number;

  if (forceVersion && forceVersion > 0) {
    if (forceVersion < MIN_QART_VERSION) {
      log.warn("Forced version is below MIN_QART_VERSION, upgrading for reliable scanning", {
        requestedVersion: forceVersion,
        minQArtVersion: MIN_QART_VERSION,
        reason: "Lower versions have insufficient ECC capacity for real phone cameras",
      });
      versionToUse = MIN_QART_VERSION;
      versionWasUpgradedForQArt = true;
    } else {
      versionToUse = forceVersion;
    }
    log.info("Using QR version for QR-Art", {
      version: versionToUse,
      wasUpgraded: versionWasUpgradedForQArt,
    });
  } else if (version > 0) {
    versionToUse = version;
    log.info("Using QR version for QR-Art", { version: versionToUse, wasUpgraded: false });
  } else {
    versionToUse = 0;
  }

  return { versionToUse, versionWasUpgradedForQArt };
}
