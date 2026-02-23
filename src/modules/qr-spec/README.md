# QR Specification Module

QR code domain knowledge - constants, patterns, and encoding rules.

## Purpose

This module provides QR code specifications and pure math:

- Alignment pattern positions
- Pattern detection (finder, timing, alignment)
- Mask functions
- BCH encoding for format/version info
- Data capacity tables
- Version/module count conversions

## Dependencies

None - pure coordinate and number math only.

## Public API

### Version and Size

```typescript
import {
  getModuleCountForVersion,
  getVersionFromModuleCount,
  getAlignmentPositions,
} from '@/modules/qr-spec';

const moduleCount = getModuleCountForVersion(5); // 37
const version = getVersionFromModuleCount(37); // 5
const alignmentPositions = getAlignmentPositions(7); // [6, 22, 38]
```

### Pattern Detection

```typescript
import {
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  isStructuralModule,
  isData,
  isLocked,
} from '@/modules/qr-spec';

// Check module types
const isFinder = isFinderPattern(row, col, moduleCount);
const isTiming = isTimingPattern(row, col, moduleCount);
const isAlignment = isAlignmentPattern(row, col, moduleCount, version);
const isStructural = isStructuralModule(row, col, moduleCount, version);
const isDataModule = isData(row, col, moduleCount, version);
const isLockedModule = isLocked(row, col, moduleCount, version);
```

### Alignment Pattern Centers

```typescript
import { getAlignmentPatternCenters } from '@/modules/qr-spec';

const centers = getAlignmentPatternCenters(version, moduleCount);
// Returns array of {row, col} for each alignment pattern center
```

### Format and Version Info

```typescript
import { isFormatInfo, isVersionInfo } from '@/modules/qr-spec';

const isFormat = isFormatInfo(row, col, moduleCount);
const isVersion = isVersionInfo(row, col, moduleCount);
```

### Mask Functions

```typescript
import { getMaskFunction } from '@/modules/qr-spec';
import type { MaskPattern } from '@/modules/qr-spec';

const maskFn = getMaskFunction(0); // Mask pattern 0
const shouldInvert = maskFn(row, col); // true/false
```

### BCH Encoding

```typescript
import { getBCHTypeInfo, getBCHTypeNumber } from '@/modules/qr-spec';

const typeInfo = getBCHTypeInfo(data); // Format info BCH
const typeNumber = getBCHTypeNumber(version); // Version info BCH
```

### Data Capacity Tables

```typescript
import {
  ECC_CAPACITIES_NUMERIC,
  ECC_CAPACITIES_ALPHANUMERIC,
  ECC_CAPACITIES_BYTE,
} from '@/modules/qr-spec';

// Get capacity for version 5, ECC level M
const numericCapacity = ECC_CAPACITIES_NUMERIC[5]['M']; // 116
const alphanumericCapacity = ECC_CAPACITIES_ALPHANUMERIC[5]['M']; // 71
const byteCapacity = ECC_CAPACITIES_BYTE[5]['M']; // 49
```

## Examples

### Check if Module Should Be Modified

```typescript
import { isStructuralModule, isData } from '@/modules/qr-spec';

function canModifyModule(row: number, col: number, moduleCount: number, version: number) {
  // Don't modify structural modules
  if (isStructuralModule(row, col, moduleCount, version)) {
    return false;
  }

  // Can modify data modules
  return isData(row, col, moduleCount, version);
}
```

### Draw Alignment Patterns

```typescript
import { getAlignmentPatternCenters } from '@/modules/qr-spec';

function drawAlignmentPatterns(
  ctx: CanvasRenderingContext2D,
  version: number,
  moduleCount: number,
  moduleSize: number
) {
  const centers = getAlignmentPatternCenters(version, moduleCount);

  for (const { row, col } of centers) {
    drawAlignmentPattern(ctx, col * moduleSize, row * moduleSize, moduleSize);
  }
}
```
