# QR Analyzer Module

QR code analysis, scanning, validation, and safety checking.

## Purpose

This module provides comprehensive QR code analysis:
- Decoding QR codes from images
- Content type detection
- Safety and scannability analysis
- Contrast and readability checking
- Telemetry and statistics

## Dependencies

- `qr-decoder` - QR code decoding
- `core` - Color utilities

## Public API

### High-Level Analysis

```typescript
import { 
  analyzeQRCode, 
  analyzeQRFromCanvas, 
  analyzeQRFromFile, 
  analyzeQRFromUrl 
} from '@/modules/qr-analyzer';
import type { QRAnalysisResult } from '@/modules/qr-analyzer';

const result = await analyzeQRFromFile(file);
const canvasResult = await analyzeQRFromCanvas(canvas);
const urlResult = await analyzeQRFromUrl('https://example.com/qr.png');
```

### Decoding

```typescript
import { decodeQRFromCanvas } from '@/modules/qr-analyzer';

const decoded = await decodeQRFromCanvas(canvas);
if (decoded.success) {
  console.log('Content:', decoded.data);
}
```

### Content Detection

```typescript
import { detectContentType } from '@/modules/qr-analyzer';
import type { ContentType } from '@/modules/qr-analyzer';

const type = detectContentType('https://example.com'); // 'url'
const wifiType = detectContentType('WIFI:S:MyNetwork;T:WPA;P:secret;;'); // 'wifi'
```

### Safety Analysis

```typescript
import { 
  analyzeQR, 
  validateModuleSize, 
  validateQuietZone, 
  validateOverlayIntensity 
} from '@/modules/qr-analyzer';
import type { SafetyOptions, AnalysisResult } from '@/modules/qr-analyzer';

const analysis = analyzeQR(qrMatrix, {
  minModuleSize: 4,
  minQuietZone: 4,
  mode: 'balanced',
});

if (analysis.warnings.length > 0) {
  console.log('Warnings:', analysis.warnings);
}
```

### Scanning and Validation

```typescript
import { 
  scanCanvas, 
  validateQRCode, 
  validateQRCodeRobust 
} from '@/modules/qr-analyzer';

const scanResult = await scanCanvas(canvas);
const isValid = await validateQRCode(canvas, expectedContent);
const robustValidation = await validateQRCodeRobust(canvas, expectedContent);
```

### Contrast Analysis

```typescript
import { analyzeContrast, analyzeMatrixContrast } from '@/modules/qr-analyzer';

const contrast = analyzeContrast(foreground, background);
const matrixContrast = analyzeMatrixContrast(qrMatrix, canvas);
```

### Telemetry

```typescript
import { calculateContrastStats, calculateAnalysisStats } from '@/modules/qr-analyzer';

const contrastStats = calculateContrastStats(samples);
const analysisStats = calculateAnalysisStats(results);
```

## Examples

### Validate QR Code Before Export

```typescript
import { validateQRCodeRobust, analyzeQR } from '@/modules/qr-analyzer';

async function validateBeforeExport(canvas: HTMLCanvasElement, content: string) {
  // Check if QR code is scannable
  const validation = await validateQRCodeRobust(canvas, content);
  
  if (!validation.valid) {
    throw new Error('QR code is not scannable');
  }
  
  // Check for safety issues
  const analysis = analyzeQR(qrMatrix, { mode: 'strict' });
  
  if (analysis.issues.length > 0) {
    console.warn('Safety issues:', analysis.issues);
  }
  
  return true;
}
```

### Analyze Uploaded QR Code

```typescript
import { analyzeQRFromFile } from '@/modules/qr-analyzer';

async function handleUpload(file: File) {
  const result = await analyzeQRFromFile(file);
  
  console.log('Content:', result.content);
  console.log('Type:', result.contentType);
  console.log('Version:', result.version);
  console.log('ECC Level:', result.eccLevel);
}
```
