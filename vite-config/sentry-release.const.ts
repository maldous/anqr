import { packageVersion } from "./package-version.const";

export const sentryRelease =
  process.env.SENTRY_RELEASE || `anqr@${process.env.npm_package_version || packageVersion}`;
