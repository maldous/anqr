export const overlayHostnameSafetyCache = new Map<
  string,
  { isPrivate: boolean; expiresAt: number }
>();
