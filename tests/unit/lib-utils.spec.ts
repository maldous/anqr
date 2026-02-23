import { describe, expect, it } from 'vitest';

import { cn } from '../../src/lib/utils';

describe('lib utils', () => {
  it('merges conditional and tailwind classes', () => {
    const falsy = false as boolean;
    const className = cn('p-2', falsy && 'hidden', 'p-4', ['text-sm', undefined], {
      'font-bold': true,
    });
    expect(className).toContain('p-4');
    expect(className).not.toContain('p-2');
    expect(className).toContain('text-sm');
    expect(className).toContain('font-bold');
  });
});
