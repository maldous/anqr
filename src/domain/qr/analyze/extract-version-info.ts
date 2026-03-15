export function extractVersionInfo(
  code: { version?: number | null },
  avgFinderDist: number
): { version: number | null; moduleCount: number; estimatedModulePx: number | null } {
  const version =
    typeof code.version === 'number' && code.version >= 1 && code.version <= 40
      ? code.version
      : null;
  const moduleCount = version === null ? 0 : 17 + version * 4;
  const estimatedModulePx = moduleCount > 0 ? avgFinderDist / (moduleCount - 7) : null;
  return { version, moduleCount, estimatedModulePx };
}
