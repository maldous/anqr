import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

function extractPayloadKinds(payloadKindSource: string): string[] {
  const unionMatch = payloadKindSource.match(/export type PayloadKind =([\s\S]*?);?\s*$/);
  if (!unionMatch) {
    throw new Error('Unable to locate PayloadKind union');
  }
  return [...unionMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function extractSwitchKinds(serializersSource: string): Set<string> {
  const registryMatch = serializersSource.match(
    /export const PAYLOAD_SERIALIZERS[^{]*\{([\s\S]*?)\n\};/
  );
  if (!registryMatch) {
    throw new Error('Unable to locate PAYLOAD_SERIALIZERS registry');
  }
  return new Set([...registryMatch[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]));
}

function extractUIKinds(categorySource: string): Set<string> {
  return new Set([...categorySource.matchAll(/value: '([^']+)' as PayloadKind/g)].map((m) => m[1]));
}

function extractTextDrivenKinds(hooksSource: string): Set<string> {
  return new Set(
    [...hooksSource.matchAll(/payloadKind === '([^']+)'[\s\S]*?setPayloadText\(/g)].map((m) => m[1])
  );
}

describe('Payload matrix guard', () => {
  const payloadKindSource = readRepoFile('src/store/types/payload-kind.ts');
  const serializersSource = readRepoFile('src/store/payload-serializers/index.ts');
  const categorySource = readRepoFile(
    'src/features/generator/components/sections/payload-category-keys.ts'
  );
  const hooksSource = readRepoFile(
    'src/features/generator/components/sections/payload-payment-form-hooks.ts'
  );
  const payloadKinds = extractPayloadKinds(payloadKindSource);
  const switchKinds = extractSwitchKinds(serializersSource);
  const uiKinds = extractUIKinds(categorySource);
  const textDrivenKinds = extractTextDrivenKinds(hooksSource);
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
