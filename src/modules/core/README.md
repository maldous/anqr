# Core Module

Pure utilities with no dependencies - the foundation layer.

## Purpose

This module provides fundamental utilities used throughout the codebase:

- Color parsing, conversion, and manipulation
- Math utilities (clamp, random, interpolation)
- Basic types (RGB, RGBA, HSL)
- Gradient utilities
- Color harmony functions
- Contrast checking

## Dependencies

None - this is the foundation layer with zero dependencies.

## Public API

### Color Parsing

```typescript
import { parseColor, parseHex, parseRgbString, parseHslString } from '@/modules/core';

const rgb = parseColor('#ff5500');
const hex = parseHex('ff5500');
const fromRgb = parseRgbString('rgb(255, 85, 0)');
const fromHsl = parseHslString('hsl(20, 100%, 50%)');
```

### Color Conversion

```typescript
import { rgbToHex, rgbToHsl, hslToRgb, rgbToGray } from '@/modules/core';

const hex = rgbToHex({ r: 255, g: 85, b: 0 }); // '#ff5500'
const hsl = rgbToHsl(255, 85, 0); // { h: 20, s: 100, l: 50 }
const rgb = hslToRgb(20, 100, 50); // { r: 255, g: 85, b: 0 }
const gray = rgbToGray(255, 85, 0); // 0.35
```

### Color Blending

```typescript
import { blendColors, alphaBlend, multiplyBlend, screenBlend } from '@/modules/core';

const blended = blendColors(color1, color2, 0.5);
const alpha = alphaBlend(foreground, background, 0.7);
const multiply = multiplyBlend(color1, color2);
const screen = screenBlend(color1, color2);
```

### Contrast

```typescript
import { getContrastRatio, meetsContrastAA, adjustForContrast } from '@/modules/core';

const ratio = getContrastRatio(foreground, background); // 4.5
const passes = meetsContrastAA(foreground, background); // true
const adjusted = adjustForContrast(color, background, 4.5);
```

### Math Utilities

```typescript
import { clamp, clamp01, lerp, createSeededRandom } from '@/modules/core';

const clamped = clamp(value, 0, 100);
const normalized = clamp01(value);
const interpolated = lerp(0, 100, 0.5); // 50
const random = createSeededRandom(12345);
```

### Gradients

```typescript
import { getGradientColorAt, createCssGradient } from '@/modules/core';

const color = getGradientColorAt(gradientConfig, 0.5);
const css = createCssGradient(gradientConfig);
```

### Color Harmony

```typescript
import { getComplementary, getAnalogous, getTriadic } from '@/modules/core';

const complement = getComplementary(baseColor);
const analogous = getAnalogous(baseColor);
const triadic = getTriadic(baseColor);
```

## Examples

### Ensure Readable Text

```typescript
import { getContrastRatio, adjustForContrast } from '@/modules/core';

function getReadableTextColor(background: RGB): RGB {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  return getContrastRatio(white, background) > getContrastRatio(black, background) ? white : black;
}
```

### Generate Color Palette

```typescript
import { getAnalogous, rgbToHex } from '@/modules/core';

const baseColor = { r: 66, g: 133, b: 244 };
const palette = getAnalogous(baseColor).map(rgbToHex);
// ['#4285f4', '#4254f4', '#42b5f4']
```
