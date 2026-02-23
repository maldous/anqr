// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isNativePlatform, downloadUrl } = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
  downloadUrl: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform } }));
vi.mock('../../src/modules/exporter/utils', async () => {
  const actual = await vi.importActual<any>('../../src/modules/exporter/utils');
  return { ...actual, downloadUrl };
});

import { downloadVectorSvg, exportVectorSvg } from '../../src/modules/exporter/vector-svg';

function fullMatrix(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => true));
}

async function blobToString(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

describe('exporter vector svg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);
  });

  it('exports styled vector svg with linear gradient and rich metadata', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:vector');

    const result = exportVectorSvg(fullMatrix(25), {
      moduleSize: 8,
      margin: 3,
      fgColor: '#112233',
      bgColor: '#fefefe',
      filename: 'vector-test',
      moduleStyle: 'rounded',
      cornerRadius: 50,
      finderStyle: 'circle',
      eyeOuterStyle: 'rounded',
      eyeInnerStyle: 'circle',
      alignmentStyle: 'rounded',
      timingStyle: 'dashed',
      gradient: {
        type: 'linear',
        angle: 45,
        stops: [
          { pos: 0, color: '#000000' },
          { pos: 1, color: '#ffffff' },
        ],
      },
      metadata: {
        title: 'A&B',
        description: 'x<y',
        author: 'Me',
        copyright: 'C',
        creationTime: true,
        software: 'ANQR',
      },
    });

    expect(result.filename).toBe('vector-test.svg');
    expect(result.format).toBe('svg');
    expect(result.width).toBeGreaterThan(0);

    const svg = await blobToString(result.blob);
    expect(svg).toContain('<linearGradient id="qr-gradient"');
    expect(svg).toContain('<title>A&amp;B</title>');
    expect(svg).toContain('<desc>x&lt;y</desc>');
    expect(svg).toContain('<dc:creator>Me</dc:creator>');
    expect(svg).toContain('<dc:date>');
    expect(svg).toContain('fill="url(#qr-gradient)"');

    createObjectURL.mockRestore();
  });

  it('covers alternate styles and gradient types', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:v');

    const radial = exportVectorSvg(fullMatrix(21), {
      moduleStyle: 'dots',
      finderStyle: 'rounded',
      eyeOuterStyle: 'circle',
      eyeInnerStyle: 'square',
      alignmentStyle: 'match_finder',
      timingStyle: 'solid',
      gradient: { type: 'radial', stops: [{ pos: 0, color: '#f00' }] },
    });
    const radialSvg = await blobToString(radial.blob);
    expect(radialSvg).toContain('<radialGradient id="qr-gradient"');

    const conic = exportVectorSvg(fullMatrix(21), {
      moduleStyle: 'diamond',
      finderStyle: 'square',
      alignmentStyle: 'circle',
      timingStyle: 'match_module',
      gradient: { type: 'conic', stops: [{ pos: 0, color: '#0f0' }] },
    });
    const conicSvg = await blobToString(conic.blob);
    expect(conicSvg).toContain('<radialGradient id="qr-gradient"');

    const plain = exportVectorSvg(fullMatrix(21), {
      moduleStyle: 'connected',
      gradient: { type: 'none', stops: [] },
    });
    const plainSvg = await blobToString(plain.blob);
    expect(plainSvg).not.toContain('<linearGradient');
    expect(plainSvg).not.toContain('<radialGradient');

    createObjectURL.mockRestore();
  });

  it('downloads vector svg and revokes URL only on web', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:dl');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const matrix = fullMatrix(21);

    isNativePlatform.mockReturnValue(false);
    downloadVectorSvg(matrix, { filename: 'd1' });
    expect(downloadUrl).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:dl');

    isNativePlatform.mockReturnValue(true);
    downloadVectorSvg(matrix, { filename: 'd2' });
    expect(revokeObjectURL.mock.calls.length).toBe(1);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});
