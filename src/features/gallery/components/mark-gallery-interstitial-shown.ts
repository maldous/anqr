import { galleryInterstitialGuard } from './gallery-interstitial-guard';

export function markGalleryInterstitialShown() {
  galleryInterstitialGuard.value = true;
  try {
    sessionStorage.setItem('galleryInterstitialShown', 'true');
  } catch {
    // Ignore storage errors
  }
}
