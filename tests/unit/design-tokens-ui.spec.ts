import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('design token adoption in shared UI', () => {
  it('defines typography, spacing, sizing, and motion tokens in global styles', () => {
    const css = read('src/index.css');
    expect(css).toContain('--type-size-sm: 0.875rem;');
    expect(css).toContain('--space-3: 0.75rem;');
    expect(css).toContain('--size-control-md: 2.5rem;');
    expect(css).toContain('--motion-duration-fast: 150ms;');
    expect(css).toContain('--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);');
  });

  it('uses control sizing and spacing tokens in core primitives', () => {
    const button = read('src/components/ui/button.tsx');
    const input = read('src/components/ui/input.tsx');
    const textarea = read('src/components/ui/textarea.tsx');
    const select = read('src/components/ui/select.tsx');

    expect(button).toContain('h-[var(--size-control-md)]');
    expect(input).toContain('h-[var(--size-control-md)]');
    expect(textarea).toContain('min-h-[calc(var(--size-control-md)*2)]');
    expect(select).toContain('h-[var(--size-control-md)]');
    expect(select).toContain('text-[length:var(--type-size-sm)]');
  });
});
