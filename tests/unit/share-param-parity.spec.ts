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
    const clientPath = path.resolve(__dirname, '../../src/modules/share-links/url-params.ts');
    const serverPath = path.resolve(__dirname, '../../netlify/functions/qr.ts');
    const clientText = fs.readFileSync(clientPath, 'utf8');
    const serverText = fs.readFileSync(serverPath, 'utf8');

    const clientKeys = extractKeys(clientText);
    const serverKeys = extractKeys(serverText);

    const clientOnly = [...clientKeys].filter((k) => !serverKeys.has(k)).sort();
    const serverOnly = [...serverKeys].filter((k) => !clientKeys.has(k)).sort();

    // Client/server parity is now complete for all client-emitted keys.
    const allowClientOnly: string[] = [];

    const allowServerOnly: string[] = ['_fullRender'];

    expect(clientOnly).toEqual(allowClientOnly);
    expect(serverOnly).toEqual(allowServerOnly);
  });
});
