# QR Generator Module

High-level QR code generation with styling, overlays, and effects.

## Purpose

This module provides the main QR code generation functionality:

- Generate styled QR codes
- Overlay image processing
- Multiple module styles (square, rounded, dots, diamond)
- Gradient fills
- Finder pattern customization
- Frame and watermark support
- Dithering effects

## Dependencies

- `qr-encoder` - QR matrix generation
- `qr-spec` - QR specifications
- `core` - Color utilities
- `overlay` - Image filters
- `dither-algorithms` - Dithering

## Public API

### Main Generator Class

```typescript
import { QRGenerator } from '@/modules/qr-generator';
import type { QRGeneratorConfig } from '@/modules/qr-generator';

const generator = new QRGenerator();

const config: QRGeneratorConfig = {
  text: 'https://example.com',
  moduleSize: 10,
  foreground: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  moduleStyle: 'rounded',
  quietZone: 4,
};

const result = generator.generate(config);
console.log('Canvas:', result.canvas);
console.log('Matrix:', result.matrix);
```

### Canvas Factory

```typescript
import { defaultBrowserCanvasFactory } from '@/modules/qr-generator';
import type { CanvasFactory } from '@/modules/qr-generator';

// Use default browser factory
const canvas = await defaultBrowserCanvasFactory.createCanvas(256, 256);

// Custom factory for Node.js
const nodeFactory: CanvasFactory = {
  createCanvas: (w, h) => createServerCanvas(w, h),
};
```

### Blue Noise Dithering

```typescript
import { generateBlueNoiseDithered } from '@/modules/qr-generator';

const result = await generateBlueNoiseDithered({
  text: 'Hello',
  ecc: 'M',
  scale: 4,
  overlayCanvas: imageCanvas,
  overlayIntensity: 50,
  colorMode: 'color',
});
```

### Overlay Processing

```typescript
import { getOverlayData, preprocessOverlay } from '@/modules/qr-generator';

const overlayData = await getOverlayData(overlayCanvas, 256, 256);
const processed = await preprocessOverlay(overlayCanvas, options);
```

### Drawing Functions

```typescript
import {
  drawModule,
  drawFinderPatternComplete,
  drawAlignmentPattern,
  drawFrame,
  createGradientFill,
} from '@/modules/qr-generator';

// Draw single module
drawModule(ctx, x, y, size, style, radius);

// Draw complete finder pattern
drawFinderPatternComplete(ctx, x, y, moduleSize, outerStyle, innerStyle);

// Create gradient
const gradient = createGradientFill(ctx, gradientConfig, width, height);
```

### Caching

```typescript
import { clearQRCaches, qrMatrixCache, overlayDataCache } from '@/modules/qr-generator';

// Clear all caches
clearQRCaches();

// Access individual caches
qrMatrixCache.clear();
overlayDataCache.clear();
```

## Examples

### Generate Styled QR Code

```typescript
import { QRGenerator } from '@/modules/qr-generator';

const generator = new QRGenerator();

const canvas = generator.generate({
  text: 'https://example.com',
  moduleSize: 10,
  foreground: '#1a73e8',
  background: '#ffffff',
  moduleStyle: 'dots',
  finderOuterStyle: 'rounded',
  finderInnerStyle: 'circle',
  cornerRadius: 0.5,
  quietZone: 4,
});

document.body.appendChild(canvas.canvas);
```

### Generate with Overlay Image

```typescript
import { QRGenerator } from '@/modules/qr-generator';

const generator = new QRGenerator();

const result = generator.generate({
  text: 'https://example.com',
  moduleSize: 8,
  overlayImage: logoCanvas,
  overlayMode: 'center',
  overlayIntensity: 30,
  errorCorrectionLevel: 'H', // Higher ECC for overlay
});
```

### Generate with Gradient

```typescript
import { QRGenerator } from '@/modules/qr-generator';

const generator = new QRGenerator();

const result = generator.generate({
  text: 'Hello World',
  moduleSize: 10,
  gradient: {
    type: 'linear',
    angle: 45,
    stops: [
      { offset: 0, color: '#ff0000' },
      { offset: 1, color: '#0000ff' },
    ],
  },
});
```
