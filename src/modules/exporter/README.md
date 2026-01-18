# Exporter Module

File export functionality for PNG, GIF, SVG, and vector SVG.

## Purpose

This module handles exporting QR codes to various file formats:
- Raster formats: PNG, WebP, JPEG
- Animated formats: GIF
- Vector formats: SVG, Vector SVG (true vector)
- PNG metadata embedding (DPI, author, etc.)

## Dependencies

- `browser-io` - Canvas utilities and downloads
- `platform` - Native file saving

## Public API

### Image Export (PNG, WebP, JPEG)

```typescript
import { exportImage, downloadImage } from '@/modules/exporter';
import type { ExportConfig } from '@/modules/exporter';

const config: ExportConfig = {
  format: 'png',
  width: 512,
  height: 512,
  quality: 0.92,
};

const blob = await exportImage(canvas, config);
downloadImage(canvas, 'qrcode.png', config);
```

### GIF Export

```typescript
import { exportGif, downloadGif } from '@/modules/exporter';

const gifBlob = await exportGif(frames, {
  width: 256,
  height: 256,
  delay: 100,
  palette: 256,
});

await downloadGif(frames, 'animated.gif', options);
```

### SVG Export

```typescript
import { exportSvg, downloadSvg } from '@/modules/exporter';

const svgString = exportSvg(canvas, { width: 512, height: 512 });
downloadSvg(canvas, 'qrcode.svg', options);
```

### Vector SVG Export

```typescript
import { exportVectorSvg, downloadVectorSvg } from '@/modules/exporter';
import type { VectorSvgConfig } from '@/modules/exporter';

const vectorConfig: VectorSvgConfig = {
  matrix: qrMatrix,
  moduleSize: 10,
  foreground: '#000000',
  background: '#ffffff',
  moduleStyle: 'rounded',
};

const svgString = exportVectorSvg(vectorConfig);
downloadVectorSvg(vectorConfig, 'vector.svg');
```

### PNG Metadata

```typescript
import { embedPngMetadata, embedPngDpi } from '@/modules/exporter';
import type { PngMetadata } from '@/modules/exporter';

const metadata: PngMetadata = {
  title: 'My QR Code',
  author: 'ANQR',
  description: 'Generated with ANQR',
};

const pngWithMetadata = embedPngMetadata(pngArrayBuffer, metadata);
const pngWithDpi = embedPngDpi(pngArrayBuffer, 300);
```

## Examples

### Export High-Quality PNG

```typescript
import { exportImage, embedPngDpi } from '@/modules/exporter';

const blob = await exportImage(qrCanvas, {
  format: 'png',
  width: 1024,
  height: 1024,
});

const buffer = await blob.arrayBuffer();
const withDpi = embedPngDpi(buffer, 300);
```

### Create Animated GIF

```typescript
import { exportGif } from '@/modules/exporter';

const frames = generateAnimationFrames(qrCanvas);
const gif = await exportGif(frames, {
  width: 256,
  height: 256,
  delay: 50,
  loop: true,
});
```
