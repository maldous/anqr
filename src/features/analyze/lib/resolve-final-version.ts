export function resolveFinalVersion(
  resultVersion: number | null,
  versionToUse: number | null,
): number | null {
  if (typeof resultVersion === "number" && resultVersion >= 1 && resultVersion <= 40) {
    return resultVersion;
  }

  if (typeof versionToUse === "number" && versionToUse >= 1 && versionToUse <= 40) {
    return versionToUse;
  }

  return null;
}
