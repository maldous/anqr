export function initGalleryInterstitialGuard(): boolean {
  let next = false;
  try {
    next = sessionStorage.getItem("galleryInterstitialShown") === "true";
  } catch {
    next = false;
  }
  return next;
}
