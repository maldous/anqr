export function performSPANavigation(fullHref: string, hash: string): void {
  globalThis.history.pushState({}, "", fullHref);
  globalThis.dispatchEvent(new PopStateEvent("popstate"));

  if (hash) {
    const anchorId = hash.substring(1);
    setTimeout(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return;
  }

  globalThis.scrollTo({ top: 0, behavior: "smooth" });
}
