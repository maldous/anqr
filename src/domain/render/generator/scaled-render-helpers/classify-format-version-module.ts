export function classifyFormatVersionModule(
  flags: number,
  shouldProtectFormat: boolean,
  shouldProtectVersion: boolean
) {
  return {
    isFormat: shouldProtectFormat && (flags & 8) !== 0,
    isVersion: shouldProtectVersion && (flags & 16) !== 0,
  };
}
