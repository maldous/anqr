import { sentryRelease } from "./sentry-release.const.ts";

export function getEnvDefines() {
  const defines: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("VITE_")) {
      defines[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
    }
  }
  defines["import.meta.env.VITE_SENTRY_RELEASE"] = JSON.stringify(sentryRelease);
  return defines;
}
