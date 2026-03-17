import { packageVersion } from "./package-version.const.ts";

export const sentryRelease =
  process.env.SENTRY_RELEASE || `anqr@${process.env.npm_package_version || packageVersion}`;
