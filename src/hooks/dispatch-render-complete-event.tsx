export function dispatchRenderCompleteEvent(success: boolean, errorMessage?: string): void {
  document.dispatchEvent(
    new CustomEvent('anqr:render-complete', {
      detail: { success, error: success ? null : (errorMessage ?? null) },
    })
  );
}
