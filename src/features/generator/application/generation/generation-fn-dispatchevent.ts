/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Dispatch render-complete custom event.
 */

export function dispatchRenderCompleteEvent(success: boolean, errorMessage?: string): void {
  document.dispatchEvent(
    new CustomEvent('anqr:render-complete', {
      detail: { success, error: success ? null : (errorMessage ?? null) },
    })
  );
}
