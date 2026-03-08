# Platform Module

Platform-specific adapters for Capacitor plugins.

## Purpose

This module provides platform-specific functionality for iOS and Android native apps:

- **AdMob integration** — Banner, interstitial, and rewarded ads with test mode support
- **MediaStore file saving** — Android Documents folder persistence
- **Native toast** — OS-level toast notifications with DOM fallback
- **Web-only asset gating** — Prevents loading of web-only scripts (iubenda, AdSense, Google Fonts) on native platforms
- **Banner height tracking** — Reactive hook (`useBannerHeight`) for layout adjustments when AdMob banners are visible

## Dependencies

- `@capacitor-community/admob` — AdMob plugin (optional, lazy-loaded)
- `@capacitor/core` — Platform detection (`Capacitor.isNativePlatform()`)
- `@capacitor/ios` — iOS platform support
- Capacitor runtime

## Public API

### AdMob Service

```typescript
import {
  initializeAdMob,
  isAdMobAvailable,
  showBannerAd,
  hideBannerAd,
  showInterstitial,
  showRewardedAd,
} from '@/modules/platform';

// Initialize on app start
await initializeAdMob();

// Check availability
if (isAdMobAvailable()) {
  // Show banner at bottom
  await showBannerAd('bottom');

  // Show interstitial
  await showInterstitial();

  // Show rewarded ad
  const result = await showRewardedAd();
  if (result.rewarded) {
    console.log('User earned reward:', result.amount);
  }
}
```

### Banner Height Tracking

```typescript
import { getBannerHeight, onBannerHeightChange } from '@/modules/platform';

// Get current height
const height = getBannerHeight();

// Subscribe to height changes
const unsubscribe = onBannerHeightChange((height) => {
  console.log('Banner height changed:', height);
});

// Cleanup
unsubscribe();
```

### Generation Tracking for Ads

```typescript
import { trackGenerationAndShowAd, resetGenerationCount } from '@/modules/platform';

// Show ad every 5 generations
const shown = await trackGenerationAndShowAd(5, 'interstitial');

// Reset counter
resetGenerationCount();
```

### MediaStore Writer (Android)

```typescript
import { saveBase64ToDocuments, MediaStoreWriter } from '@/modules/platform';

// Save file to Documents folder
await saveBase64ToDocuments('qrcode.png', base64Data, 'image/png', 'ANQR');

// Use MediaStoreWriter directly
await MediaStoreWriter.saveBase64ToDocuments({
  filename: 'qrcode.png',
  base64Data,
  mimeType: 'image/png',
  subfolder: 'ANQR',
});
```

## Examples

### Initialize Ads on App Start

```typescript
import { initializeAdMob, prepareAllAds, showBottomBanner } from '@/modules/platform';

async function initApp() {
  const available = await initializeAdMob();

  if (available) {
    // Pre-load ads
    await prepareAllAds();

    // Show banner
    await showBottomBanner();
  }
}
```

### Show Ad After Export

```typescript
import { trackGenerationAndShowAd } from '@/modules/platform';

async function exportQRCode() {
  // ... export logic ...

  // Show interstitial every 3 exports
  await trackGenerationAndShowAd(3, 'interstitial');
}
```

### Native Toast

```typescript
import { showNativeToast } from '@/modules/platform/native-toast';

// Shows OS-level toast on native, DOM fallback on web
await showNativeToast('QR code saved!', 'short');
```

### Web-Only Asset Gating

```typescript
import { loadWebOnlyBootAssets } from '@/modules/platform/web-only-assets';

// Loads iubenda, AdSense, Google Fonts — skips on native platforms
loadWebOnlyBootAssets();
```

### Banner Height Hook

```typescript
import { useBannerHeight } from '@/hooks/useBannerHeight';

function MyComponent() {
  const bannerHeight = useBannerHeight(); // 0 on web, ~60px on native with banner
  return <div style={{ paddingBottom: bannerHeight }} />;
}
```

## Test Coverage

| Component | Unit Tests | E2E (iOS) | E2E (Android) |
| --- | --- | --- | --- |
| AdMob init/banner/interstitial/rewarded | `platform-admob.spec.ts` | `ios-platform.spec.ts` | `android-platform.spec.ts` |
| MediaStore file saving | `platform-media-store.spec.ts` | — | `android-platform.spec.ts` |
| Native toast | `platform-native-toast.spec.ts` | — | — |
| Web-only asset gating | `platform-web-only-assets.spec.ts` | `ios-platform.spec.ts` | `android-platform.spec.ts` |
| Banner height hook | `use-banner-height.spec.ts` | `ios-platform.spec.ts` | `android-platform.spec.ts` |
| Deep link handling | `app-deep-link.spec.ts` | `ios-platform.spec.ts` | `android-platform.spec.ts` |
