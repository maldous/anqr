# Dither Algorithms Module

Comprehensive implementation of all dithering algorithms.

## Purpose

This module provides dithering algorithms for image processing:

- Error diffusion (Floyd-Steinberg, Atkinson, etc.)
- Ordered dithering (Bayer matrices)
- Blue noise dithering
- Temporal dithering for animations
- Noise-based dithering (white, Gaussian, triangular)

## Dependencies

None - pure algorithmic implementations.

## Public API

### Main Apply Function

```typescript
import { applyDither } from '@/modules/dither-algorithms';
import type { DitherOptions } from '@/modules/dither-algorithms';

const result = applyDither(imageData, {
  kind: 'error_diffusion',
  kernel: 'floyd_steinberg',
  strength: 1.0,
  colorMode: 'bw',
});
```

### Error Diffusion

```typescript
import { errorDiffusion, distributeErrorWithKernel } from '@/modules/dither-algorithms';

const dithered = errorDiffusion(imageData, {
  kernel: 'atkinson',
  serpentine: true,
});
```

### Ordered Dithering

```typescript
import { bayerDither, orderedDither, BAYER_4, BAYER_8 } from '@/modules/dither-algorithms';

const bayer = bayerDither(imageData, BAYER_4);
const ordered = orderedDither(imageData, BAYER_8, { levels: 4 });
```

### Blue Noise

```typescript
import {
  blueNoiseDither,
  generateBlueNoiseTile,
  sampleBlueNoise,
} from '@/modules/dither-algorithms';

// Generate blue noise tile
const tile = generateBlueNoiseTile(64, seed);

// Sample blue noise at position
const value = sampleBlueNoise(x, y, tile, 64);

// Apply blue noise dithering
const dithered = blueNoiseDither(imageData, { tileSize: 64, seed: 12345 });
```

### Temporal Dithering

```typescript
import {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  isTemporalDitherActive,
} from '@/modules/dither-algorithms';

if (isTemporalDitherActive(mode)) {
  const offset = calculateTemporalOffset(frameIndex);
  applyTemporalNoiseToCanvas(canvas, offset);
}
```

### Advanced Algorithms

```typescript
import {
  edgeAwareDither,
  perceptualDither,
  adaptiveThresholdDither,
} from '@/modules/dither-algorithms';

const edgeAware = edgeAwareDither(imageData);
const perceptual = perceptualDither(imageData);
const adaptive = adaptiveThresholdDither(imageData);
```

## Examples

### Apply Floyd-Steinberg to Image

```typescript
import { applyDither } from '@/modules/dither-algorithms';

const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const result = applyDither(imageData, {
  kind: 'error_diffusion',
  kernel: 'floyd_steinberg',
  colorMode: 'bw',
});

ctx.putImageData(result.imageData, 0, 0);
```

### Create Animated Dither Effect

```typescript
import { applyTemporalNoiseToCanvas, calculateTemporalOffset } from '@/modules/dither-algorithms';

function animateFrame(frameIndex: number) {
  const offset = calculateTemporalOffset(frameIndex);
  applyTemporalNoiseToCanvas(canvas, offset);
  requestAnimationFrame(() => animateFrame(frameIndex + 1));
}
```
