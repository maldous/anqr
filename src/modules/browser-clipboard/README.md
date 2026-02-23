# Browser Clipboard Module

Clipboard operations for text and images in browser environments.

## Purpose

This module provides browser-specific clipboard functionality:

- Copy text to clipboard
- Copy images (canvas/blob) to clipboard

## Dependencies

None - uses native browser Clipboard API.

## Public API

### Copy Text

```typescript
import { copyToClipboard } from '@/modules/browser-clipboard';

await copyToClipboard('Hello, World!');
```

### Copy Image

```typescript
import { copyImageToClipboard } from '@/modules/browser-clipboard';

// Copy canvas as PNG
await copyImageToClipboard(canvas);

// Copy blob
await copyImageToClipboard(imageBlob);
```

## Examples

### Copy QR Code to Clipboard

```typescript
import { copyImageToClipboard } from '@/modules/browser-clipboard';
import { QRGenerator } from '@/modules/qr-generator';

const generator = new QRGenerator();
const canvas = generator.generate({ text: 'https://example.com' });

try {
  await copyImageToClipboard(canvas);
  console.log('QR code copied to clipboard!');
} catch (err) {
  console.error('Failed to copy:', err);
}
```

### Copy Share URL

```typescript
import { copyToClipboard } from '@/modules/browser-clipboard';
import { getShareableUrl } from '@/modules/share-links';

const url = getShareableUrl(qrConfig);
await copyToClipboard(url);
```
