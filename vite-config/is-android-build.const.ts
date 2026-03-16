export const isAndroidBuild =
  process.env.CAPACITOR_PLATFORM === "android" || process.env.npm_lifecycle_event?.includes("cap");
