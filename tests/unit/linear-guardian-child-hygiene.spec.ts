import { describe, expect, it } from 'vitest';
import {
  buildOrphanChildReport,
  computeChildHygiene,
} from '../../scripts/ops/lib/child-hygiene.mjs';

describe('linear guardian child hygiene', () => {
  it('detects open orphan [CHILD] issues', () => {
    const hygiene = computeChildHygiene([
      {
        identifier: 'ANQ-1',
        title: '[CHILD] Open orphan',
        url: 'https://linear.app/issue/ANQ-1',
        state: { name: 'Todo', type: 'unstarted' },
        parent: null,
      },
      {
        identifier: 'ANQ-2',
        title: '[CHILD] Open linked',
        url: 'https://linear.app/issue/ANQ-2',
        state: { name: 'In Progress', type: 'started' },
        parent: { id: 'parent-2' },
      },
      {
        identifier: 'ANQ-3',
        title: '[CHILD] Done orphan',
        url: 'https://linear.app/issue/ANQ-3',
        state: { name: 'Done', type: 'completed' },
        parent: null,
      },
      {
        identifier: 'ANQ-4',
        title: 'Regular issue',
        url: 'https://linear.app/issue/ANQ-4',
        state: { name: 'Todo', type: 'unstarted' },
        parent: null,
      },
    ]);

    expect(hygiene.ok).toBe(false);
    expect(hygiene.openChildCount).toBe(2);
    expect(hygiene.orphanCount).toBe(1);
    expect(hygiene.orphans).toEqual([
      {
        identifier: 'ANQ-1',
        title: '[CHILD] Open orphan',
        url: 'https://linear.app/issue/ANQ-1',
        state: 'Todo',
      },
    ]);
    expect(buildOrphanChildReport(hygiene)).toEqual([
      '[hygiene] orphan [CHILD] issues: 1',
      ' - ANQ-1: [CHILD] Open orphan',
    ]);
  });

  it('passes when there are no open orphan [CHILD] issues', () => {
    const hygiene = computeChildHygiene([
      {
        identifier: 'ANQ-5',
        title: '[CHILD] Linked',
        url: 'https://linear.app/issue/ANQ-5',
        state: { name: 'Todo', type: 'unstarted' },
        parent: { id: 'parent-5' },
      },
    ]);

    expect(hygiene.ok).toBe(true);
    expect(hygiene.orphanCount).toBe(0);
    expect(buildOrphanChildReport(hygiene)).toEqual(['[hygiene] orphan [CHILD] issues: 0']);
  });
});
