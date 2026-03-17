export function setupScrollObservers(el: HTMLElement, onUpdate: () => void): () => void {
  onUpdate();
  el.addEventListener("scroll", onUpdate, { passive: true });
  const resizeObserver = new ResizeObserver(onUpdate);
  resizeObserver.observe(el);
  return () => {
    el.removeEventListener("scroll", onUpdate);
    resizeObserver.disconnect();
  };
}
