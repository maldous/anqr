# Platform Module

Platform-specific adapters for Capacitor plugins.

## Purpose

This module provides platform-specific functionality for mobile apps:
- AdMob integration (banner, interstitial, rewarded ads)
- MediaStore file saving (Android Documents folder)

## Dependencies

- `@capacitor-community/admob` - AdMob plugin (optional, lazy-loaded)
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
  showRewardedAd 
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
await saveBase64ToDocuments(base64Data, 'qrcode.png', 'image/png');

// Use MediaStoreWriter directly
await MediaStoreWriter.writeFile({
  data: base64Data,
  filename: 'qrcode.png',
  mimeType: 'image/png',
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
