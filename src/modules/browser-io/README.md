# Browser I/O Module

Canvas to Blob conversion and download utilities for browser environments.

## Purpose

This module provides browser-specific I/O operations:

- Canvas to Blob/DataURL conversion
- File downloads (URL and Blob)
- Native file saving via Capacitor (Android/iOS)

## Dependencies

- `platform` - For native file saving on mobile

## Public API

### Canvas Utilities

```typescript
import { canvasToBlob, canvasToDataUrl } from '@/modules/browser-io';

// Convert to blob
const blob = await canvasToBlob(canvas, 'image/png', 0.92);

// Convert to data URL
const dataUrl = canvasToDataUrl(canvas, 'image/png');
```

### Download Utilities

```typescript
import { downloadBlob, downloadUrl } from '@/modules/browser-io';

// Download blob as file
downloadBlob(blob, 'qrcode.png');

// Download from URL
downloadUrl('https://example.com/image.png', 'image.png');
```

### Native Save (Mobile)

```typescript
import { saveFileNative } from '@/modules/browser-io';

// Save to device Documents folder (Android/iOS)
await saveFileNative(base64Data, 'qrcode.png', 'image/png');
```

## Examples

### Export QR Code as PNG

```typescript
import { canvasToBlob, downloadBlob } from '@/modules/browser-io';

const blob = await canvasToBlob(qrCanvas, 'image/png');
downloadBlob(blob, 'my-qrcode.png');
```

### Save on Mobile Device

```typescript
import { canvasToDataUrl, saveFileNative } from '@/modules/browser-io';

const dataUrl = canvasToDataUrl(qrCanvas);
const base64 = dataUrl.split(',')[1];

await saveFileNative(base64, 'qrcode.png', 'image/png');
```
