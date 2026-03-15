import { classifyFormatVersionModule } from './classify-format-version-module';

export function paintClassifiedModule(
  ctx: CanvasRenderingContext2D,
  flags: number,
  isDark: boolean,
  x: number,
  y: number,
  moduleSize: number,
  darkFill: string | CanvasGradient,
  bgColor: string,
  shouldProtectFormat: boolean,
  shouldProtectVersion: boolean
) {
  const { isFormat, isVersion } = classifyFormatVersionModule(
    flags,
    shouldProtectFormat,
    shouldProtectVersion
  );
  if (!isFormat && !isVersion) return { formatHit: false, versionHit: false };
  ctx.fillStyle = isDark ? darkFill : bgColor;
  ctx.fillRect(x, y, moduleSize, moduleSize);
  return { formatHit: isFormat, versionHit: isVersion };
}
