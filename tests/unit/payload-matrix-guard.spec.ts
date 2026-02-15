import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function extractPayloadKinds(storeSource: string): string[] {
  const unionMatch = storeSource.match(
    /export type PayloadKind =([\s\S]*?)\n\s*\/\/ QR encoding types/
  );
  if (!unionMatch) {
    throw new Error('Unable to locate PayloadKind union');
  }
  return [...unionMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function extractSwitchKinds(storeSource: string): Set<string> {
  const switchMatch = storeSource.match(
    /switch \(payload\.kind\) \{([\s\S]*?)\n\s*default:\n\s*return applyTransforms\(payload\.text\);/
  );
  if (!switchMatch) {
    throw new Error('Unable to locate payload.kind switch');
  }
  return new Set([...switchMatch[1].matchAll(/case '([^']+)':/g)].map((m) => m[1]));
}

function extractUIKinds(sectionSource: string): Set<string> {
  return new Set(
    [...sectionSource.matchAll(/value: '([^']+)' as PayloadKind/g)].map((m) => m[1])
  );
}

function extractTextDrivenKinds(sectionSource: string): Set<string> {
  return new Set(
    [...sectionSource.matchAll(/if \(payload\.kind === '([^']+)'.*?\)\s*\{[\s\S]*?setPayloadText\(/g)].map(
      (m) => m[1]
    )
  );
}

describe('Payload matrix guard', () => {
  const storeSource = readRepoFile('src/store/qr-store.ts');
  const sectionSource = readRepoFile('src/components/sections/PayloadSection.tsx');
  const payloadKinds = extractPayloadKinds(storeSource);
  const switchKinds = extractSwitchKinds(storeSource);
  const uiKinds = extractUIKinds(sectionSource);
  const textDrivenKinds = extractTextDrivenKinds(sectionSource);
  const generatedKinds = new Set([...switchKinds, ...textDrivenKinds]);

  it('keeps every payload kind selectable in the UI', () => {
    const missingInUi = payloadKinds.filter((kind) => !uiKinds.has(kind));
    expect(missingInUi).toEqual([]);
  });

  it('keeps every payload kind wired to a generation path', () => {
    const missingGeneration = payloadKinds.filter((kind) => !generatedKinds.has(kind));
    expect(missingGeneration).toEqual([]);
  });

  it('limits text-driven generation to known payment kinds', () => {
    const expectedTextDriven = ['epc_sepa', 'paynow', 'pix', 'promptpay', 'upi'];
    const actualTextDriven = [...textDrivenKinds].sort();
    expect(actualTextDriven).toEqual(expectedTextDriven);
  });
});
