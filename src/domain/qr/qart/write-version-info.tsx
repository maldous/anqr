import { getBCHTypeNumber } from '../encode/utils';

export function writeVersionInfo(
  modules: (boolean | null)[][],
  version: number,
  moduleCount: number
): void {
  if (version < 7) return;
  const versionBits = getBCHTypeNumber(version);
  for (let i = 0; i < 18; i++) {
    const mod = ((versionBits >> i) & 1) === 1;
    modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
    modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
  }
}
