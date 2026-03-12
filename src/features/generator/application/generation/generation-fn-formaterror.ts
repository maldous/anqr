/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Format generation error for user display.
 */

export function formatGenerationErrorMessage(
  err: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any
): string {
  const rawMessage =
    err instanceof Error
      ? err.message
      : t('errors.failedToGenerateQr', 'Failed to generate QR code');
  if (
    rawMessage.includes('code length overflow') ||
    rawMessage.includes('maximum QR code capacity')
  ) {
    return t(
      'errors.contentTooLongForQr',
      'Content too long for QR code. Please shorten your content or use a URL shortener.'
    );
  }
  return rawMessage;
}

