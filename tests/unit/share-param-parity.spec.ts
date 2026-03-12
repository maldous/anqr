import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

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
    const clientPaths = [
      '../../src/domain/share/parse-url-params-from-search-params.tsx',
      '../../src/domain/share/parse-mask-param.tsx',
      '../../src/domain/share/parse-blend-mode.tsx',
    ].map((relativePath) => path.resolve(__dirname, relativePath));
    const serverPath = path.resolve(__dirname, '../../netlify/functions/qr.ts');
    const clientText = clientPaths
      .map((clientPath) => fs.readFileSync(clientPath, 'utf8'))
      .join('\n');
    const serverText = fs.readFileSync(serverPath, 'utf8');

    const clientKeys = extractKeys(clientText);
    const serverKeys = extractKeys(serverText);

    const clientOnly = [...clientKeys].filter((k) => !serverKeys.has(k)).sort();
    const serverOnly = [...serverKeys].filter((k) => !clientKeys.has(k)).sort();

    // Client/server parity is now complete for all client-emitted keys.
    const allowClientOnly: string[] = [];

    const allowServerOnly: string[] = [
      '_fullRender',
      '_strictOverlay',
      'animSeed2',
      'bounce2',
      'colorCycle2',
      'easing2',
      'reverse2',
    ];

    expect(clientOnly).toEqual(allowClientOnly);
    expect(serverOnly).toEqual(allowServerOnly);
  });
});
