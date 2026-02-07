import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function extractKeys(text: string): Set<string> {
  const keys = new Set<string>();
  const regex = /params\.(?:get|has)\(\s*'([^']+)'\s*\)/g;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(text))) {
    keys.add(match[1]);
  }
  return keys;
}

describe('share params parity (client vs netlify function)', () => {
  it('flags client/server key mismatches', () => {
    const clientPath = path.resolve(__dirname, '../../src/modules/share-links/url-params.ts');
    const serverPath = path.resolve(__dirname, '../../netlify/functions/qr.ts');
    const clientText = fs.readFileSync(clientPath, 'utf8');
    const serverText = fs.readFileSync(serverPath, 'utf8');

    const clientKeys = extractKeys(clientText);
    const serverKeys = extractKeys(serverText);

    const clientOnly = [...clientKeys].filter((k) => !serverKeys.has(k)).sort();
    const serverOnly = [...serverKeys].filter((k) => !clientKeys.has(k)).sort();

    // TODO: shrink these allowlists to zero as parity gaps are fixed.
    const allowClientOnly = [
      'gifDisp',
      'gifDith',
      'gifMaxFps',
      'gifPal',
      'gifQuant',
      'gifTrans',
      'jpegQ',
      'lang',
      'qaRot',
      'subpixel',
      'svgVec',
    ];

    const allowServerOnly = [
      'maxOverlayIntensityH',
      'maxOverlayIntensityL',
      'maxOverlayIntensityM',
      'maxOverlayIntensityQ',
    ];

    expect(clientOnly).toEqual(allowClientOnly);
    expect(serverOnly).toEqual(allowServerOnly);
  });
});
