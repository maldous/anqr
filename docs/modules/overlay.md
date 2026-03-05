# Overlay Module

Image processing for QR code overlays.

## Purpose

This module handles image processing for QR code overlays:

- Image loading and processing
- Cropping and fitting
- Image filters (blur, sharpen, contrast, etc.)
- Dithering for overlay images
- Watermark application
- Blend modes

## Dependencies

- `core` - Color utilities
- `dither-algorithms` - Dithering functions

## Public API

### Image Loading

```typescript
import { loadImageFromFile, loadImageFromUrl, loadImageFromDataUrl } from '@/modules/overlay';

const fromFile = await loadImageFromFile(file);
const fromUrl = await loadImageFromUrl('https://example.com/image.png');
const fromDataUrl = await loadImageFromDataUrl(dataUrl);
```

### Cropping and Fitting

```typescript
import { cropOverlayImage, fitOverlayImage } from '@/modules/overlay';
import type { FitMode, CropRegion } from '@/modules/overlay';

const cropped = cropOverlayImage(image, { x: 10, y: 10, size: 100 });
const fitted = fitOverlayImage(image, 256, 256, 'cover');
```

### Image Filters

```typescript
import {
  brightness,
  contrast,
  gamma,
  blur,
  sharpen,
  grayscale,
  posterize,
  threshold,
  sobelEdge,
  cannyEdge,
} from '@/modules/overlay';

const adjusted = brightness(imageData, 1.2);
const sharpened = sharpen(imageData);
const edges = sobelEdge(imageData);
```

### Apply Filters Pipeline

```typescript
import { applyFilters } from '@/modules/overlay';
import type { FilterOptions } from '@/modules/overlay';

const options: FilterOptions = {
  brightness: 1.1,
  contrast: 1.2,
  blur: 1,
  grayscale: true,
};

const filtered = applyFilters(imageData, options);
```

### Overlay Processing

```typescript
import { processOverlay } from '@/modules/overlay';
import type { OverlayOptions } from '@/modules/overlay';

const processed = await processOverlay(image, {
  fitMode: 'cover',
  brightness: 1.0,
  contrast: 1.0,
  ditherKind: 'blue_noise',
});
```

### Watermarks

```typescript
import { applyWatermark, renderTextWatermark } from '@/modules/overlay';
import type { WatermarkOptions } from '@/modules/overlay';

const watermarkOptions: WatermarkOptions = {
  kind: 'text',
  text: 'ANQR',
  position: 'bottom-right',
  opacity: 0.5,
};

const watermarked = await applyWatermark(canvas, watermarkOptions);
```

### Blend Modes

```typescript
import { applyCanvasBlendMode } from '@/modules/overlay';

applyCanvasBlendMode(targetCanvas, overlayCanvas, 'multiply', 0.8);
```

## Examples

### Process Overlay for QR Code

```typescript
import { processOverlay, applyOverlayDitherForQR } from '@/modules/overlay';

const processed = await processOverlay(overlayImage, {
  fitMode: 'cover',
  brightness: 1.0,
  contrast: 1.1,
});

const dithered = applyOverlayDitherForQR(processed.canvas, {
  kind: 'blue_noise',
  colorMode: 'grayscale',
});
```

### Add Watermark to QR Code

```typescript
import { applyWatermark } from '@/modules/overlay';

const watermarked = await applyWatermark(qrCanvas, {
  kind: 'text',
  text: 'Scan Me',
  position: 'bottom',
  opacity: 0.7,
  blend: 'overlay',
});
```
