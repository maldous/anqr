# QR Decoder Module

Our own QR code decoder - zero external dependencies.

## Purpose

This module provides QR code decoding without external dependencies:
- Decode QR codes from canvas/ImageData
- Locate QR codes in images
- Extract and decode QR data
- Support for all QR versions and ECC levels

## Dependencies

- `qr-spec` - QR code specifications

## Public API

### Main Decoder

```typescript
import { decodeQR } from '@/modules/qr-decoder';
import type { DecodeResult } from '@/modules/qr-decoder';

const result = decodeQR(imageData);

if (result.success) {
  console.log('Decoded:', result.data);
  console.log('Version:', result.version);
  console.log('ECC:', result.eccLevel);
} else {
  console.log('Failed:', result.error);
}
```

### Canvas Decoder

```typescript
import { decodeFromCanvas } from '@/modules/qr-decoder';

const result = decodeFromCanvas(canvas);
if (result.success) {
  console.log('Content:', result.data);
}
```

## Examples

### Decode QR from Image Element

```typescript
import { decodeFromCanvas } from '@/modules/qr-decoder';

async function decodeFromImage(img: HTMLImageElement) {
  // Draw image to canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  // Decode
  return decodeFromCanvas(canvas);
}
```

### Decode QR from File Upload

```typescript
import { decodeFromCanvas } from '@/modules/qr-decoder';

async function decodeFromFile(file: File) {
  const img = await createImageBitmap(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  return decodeFromCanvas(canvas);
}
```
