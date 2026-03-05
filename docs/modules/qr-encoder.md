# QR Encoder Module

Our own QR code generator - zero external dependencies.

## Purpose

This module provides QR code encoding without external dependencies:

- Generate QR code matrices
- Support for all versions (1-40) and ECC levels
- Multiple encoding modes (numeric, alphanumeric, byte, kanji)
- Low-level access to QR internals

## Dependencies

- `qr-spec` - QR code specifications (re-exported)

## Public API

### Main Encoder

```typescript
import { qrcode } from '@/modules/qr-encoder';

const qr = qrcode(0, 'M'); // Auto version, Medium ECC
qr.addData('https://example.com');
qr.make();

const size = qr.getModuleCount();
for (let row = 0; row < size; row++) {
  for (let col = 0; col < size; col++) {
    const isDark = qr.isDark(row, col);
  }
}
```

### High-Level API

```typescript
import { generateQR, createQRInstance, calculateOptimalVersion } from '@/modules/qr-encoder';
import type { QRMatrix, QROptions } from '@/modules/qr-encoder';

// Generate matrix directly
const matrix = generateQR('Hello World', { errorCorrectionLevel: 'H' });
console.log('Size:', matrix.size);
console.log('Version:', matrix.version);

// Create instance for more control
const instance = createQRInstance('Hello World', 'M', 0);

// Calculate optimal version
const version = calculateOptimalVersion('Hello World', 'M');
```

### Encoding Mode Detection

```typescript
import { getCompatibleMode } from '@/modules/qr-encoder';

const mode = getCompatibleMode('12345', 'auto'); // 'numeric'
const alphaMode = getCompatibleMode('HELLO123', 'auto'); // 'alphanumeric'
const byteMode = getCompatibleMode('Hello!', 'auto'); // 'byte'
```

### Pattern Functions (re-exported from qr-spec)

```typescript
import {
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
} from '@/modules/qr-encoder';

if (isFinderPattern(row, col, moduleCount)) {
  // This is a finder pattern
}
```

### Low-Level APIs

```typescript
import {
  qrBitBuffer,
  qr8BitByte,
  qrAlphaNum,
  getBCHTypeInfo,
  getLostPoint,
} from '@/modules/qr-encoder';

// Create bit buffer
const buffer = qrBitBuffer();
buffer.put(4, 4); // Mode indicator
buffer.put(11, 10); // Character count

// Create data segment
const segment = qr8BitByte('Hello');
```

## Examples

### Generate QR Code Matrix

```typescript
import { generateQR } from '@/modules/qr-encoder';

const matrix = generateQR('https://example.com', {
  errorCorrectionLevel: 'H',
  version: 0, // Auto
});

// Draw to canvas
const moduleSize = 10;
for (let row = 0; row < matrix.size; row++) {
  for (let col = 0; col < matrix.size; col++) {
    if (matrix.modules[row][col]) {
      ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
    }
  }
}
```

### Create Data URL

```typescript
import { qrcode, createDataURL } from '@/modules/qr-encoder';

const qr = qrcode(0, 'M');
qr.addData('Hello World');
qr.make();

const dataUrl = createDataURL(qr.getModuleCount(), (row, col) => qr.isDark(row, col));
```
