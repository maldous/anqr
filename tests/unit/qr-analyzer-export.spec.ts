import { describe, expect, it } from 'vitest';
import { buildAnalysisExportData, type QRAnalysisResult } from '../../src/modules/qr-analyzer';

describe('qr-analyzer export builder', () => {
  it('builds stable export payload with compact module matrix', () => {
    const result: QRAnalysisResult = {
      success: true,
      payload: 'https://example.com/x',
      payloadBytes: new Uint8Array([104, 105]),
      version: 1,
      moduleCount: 21,
      eccLevel: 'M',
      maskPattern: 3,
      encodingMode: 'byte',
      errorsCorrected: 0,
      estimatedModulePx: 5.5,
      quietZone: { top: 4, right: 4, bottom: 4, left: 4, adequate: true },
      detectedColors: { foreground: '#000000', background: '#ffffff', contrastRatio: 21 },
      moduleMatrix: [
        [true, false, true],
        [false, true, false],
      ],
      geometry: {
        corners: {
          topLeft: { x: 10, y: 10 },
          topRight: { x: 110, y: 12 },
          bottomLeft: { x: 11, y: 111 },
          bottomRight: { x: 111, y: 112 },
        },
        boundingBox: { minX: 10, minY: 10, maxX: 111, maxY: 112, width: 101, height: 102 },
        topEdgePx: 100.02,
        leftEdgePx: 101.0,
        estimatedRotationDeg: 1.1,
      },
      timing: {
        decodeMs: 12.34,
        totalAnalysisMs: 19.87,
      },
    };

    const out = buildAnalysisExportData(result, {
      timestamp: '2026-02-07T00:00:00.000Z',
      source: 'generator',
      actualUsedVersion: 2,
    });

    expect(out.version).toBe('1.1');
    expect(out.timestamp).toBe('2026-02-07T00:00:00.000Z');
    expect(out.source).toBe('generator');
    expect(out.analysis.moduleMatrix).toEqual(['101', '010']);
    expect(out.generatorSettings.version).toBe(2);
    expect(out.diagnostics.summary.scannable).toBe(true);
    expect(out.diagnostics.summary.quietZoneAdequate).toBe(true);
    expect(out.diagnostics.summary.estimatedRotationDeg).toBeCloseTo(1.1, 5);
    expect(out.analysis.timing).toEqual({ decodeMs: 12.34, totalAnalysisMs: 19.87 });
    expect(out.diagnostics.summary.decodeMs).toBe(12.34);
    expect(out.diagnostics.summary.totalAnalysisMs).toBe(19.87);
  });

  it('omits invalid generator encoding mode values', () => {
    const result: QRAnalysisResult = {
      success: true,
      payload: 'abc',
      version: 1,
      moduleCount: 21,
      eccLevel: 'L',
      maskPattern: 0,
      encodingMode: 'mixed',
      errorsCorrected: null,
      estimatedModulePx: null,
    };

    const out = buildAnalysisExportData(result);
    expect(out.generatorSettings.encodingMode).toBeUndefined();
  });
});
