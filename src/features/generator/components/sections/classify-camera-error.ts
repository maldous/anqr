export function classifyCameraError(error: unknown, t: (key: string) => string): string | null {
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage.includes('cancelled') || errorMessage.includes('User cancelled')) return null;
  if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
    return t('camera.permissionDenied');
  }
  return t('camera.error');
}
