# Animation Module

Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects.

## Purpose

This module provides comprehensive animation support for QR codes, including:

- Parsing animated images (GIF, WebP, APNG)
- Frame management and decimation
- Animation patterns (pulse, wave, scanline, shimmer, drift)
- Temporal dithering for smoother animations
- Color cycling effects

## Dependencies

- `dither-algorithms` - Temporal dithering algorithms

## Public API

### Parsing

```typescript
import {
  parseAnimatedImage,
  parseGifFrames,
  parseWebPFrames,
  getGifDelays,
} from '@/modules/animation';

// Parse any animated image format
const frames = await parseAnimatedImage(file);

// Parse GIF specifically
const gifFrames = await parseGifFrames(arrayBuffer);

// Get frame delays from GIF
const delays = getGifDelays(arrayBuffer);
```

### Animation Patterns

```typescript
import { generateAnimationPatternFrames, applyAnimationPattern } from '@/modules/animation';
import type { AnimationPattern } from '@/modules/animation';

// Generate frames with pattern
const frames = generateAnimationPatternFrames(baseCanvas, {
  pattern: 'pulse',
  frameCount: 30,
  speed: 100,
});

// Apply pattern to existing frame
const modifiedCanvas = applyAnimationPattern(canvas, 'wave', frameIndex, totalFrames);
```

### State Management

```typescript
import { createAnimationState, advanceAnimation, getNextFrame } from '@/modules/animation';

const state = createAnimationState(frames, { fps: 30, loop: true });
const nextState = advanceAnimation(state, deltaTime);
const frame = getNextFrame(state);
```

### GIF Compositor

```typescript
import { createGifCompositor } from '@/modules/animation';

const compositor = createGifCompositor(gifFrames, { width: 200, height: 200 });
const composited = compositor.getFrame(0);
```

## Examples

### Parse and Display Animated GIF

```typescript
import { parseGifFrames, createAnimationLoop } from '@/modules/animation';

const response = await fetch('animation.gif');
const buffer = await response.arrayBuffer();
const frames = await parseGifFrames(buffer);

const loop = createAnimationLoop(frames, (frame) => {
  ctx.drawImage(frame.canvas, 0, 0);
});

loop.start();
```

### Apply Pulse Effect to QR Code

```typescript
import { generateAnimationPatternFrames } from '@/modules/animation';

const animatedFrames = generateAnimationPatternFrames(qrCanvas, {
  pattern: 'pulse',
  frameCount: 24,
  speed: 80,
  seed: 12345,
});
```
