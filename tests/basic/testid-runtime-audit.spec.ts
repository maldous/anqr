import { expect, test } from '../fixtures/test-fixtures';
import { openAccordion, selectTier } from '../helpers/test-utils';

async function auditPageTestIds(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const selector = [
      'button',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[role="switch"]',
      '[role="slider"]',
      '[role="tab"]',
      '[role="combobox"]',
      '[role="option"]',
      'a[href]',
    ].join(',');

    const elements = Array.from(document.querySelectorAll(selector));
    const missing: string[] = [];
    const counts = new Map<string, number>();

    for (const el of elements) {
      const id = el.getAttribute('data-testid');
      if (!id) {
        missing.push((el as HTMLElement).outerHTML.slice(0, 180));
        continue;
      }
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    const duplicates = Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([id, count]) => `${id} (${count})`);

    return { missing, duplicates, total: elements.length };
  });
}

test.describe('Runtime Test ID Audit', () => {
  test.describe.configure({ timeout: 180000 });
  async function assertNoMissingOrDuplicate(page: import('@playwright/test').Page, label: string) {
    const result = await auditPageTestIds(page);
    expect(result.missing, `${label}: missing IDs on ${result.total} interactive elements`).toEqual(
      []
    );
    expect(result.duplicates, `${label}: duplicate IDs found`).toEqual([]);
  }

  test('all primary routes and editor states have unique data-testid on interactive elements', async ({
    page,
    waitForQRRender,
  }) => {
    const sectionsByTier: Record<
      'basic' | 'advanced' | 'professional',
      readonly [
        'payload',
        'overlay',
        ...(
          | 'qr'
          | 'render'
          | 'animation'
          | 'output'
          | 'watermark'
          | 'metadata'
          | 'share'
          | 'safety'
        )[],
      ]
    > = {
      basic: ['payload', 'overlay'],
      advanced: ['payload', 'overlay', 'qr', 'render', 'animation', 'output'],
      professional: [
        'payload',
        'overlay',
        'qr',
        'render',
        'animation',
        'output',
        'watermark',
        'metadata',
        'share',
        'safety',
      ],
    };

    await page.goto('/');
    await waitForQRRender();
    await assertNoMissingOrDuplicate(page, 'editor/base');

    for (const tier of ['basic', 'advanced', 'professional'] as const) {
      await selectTier(page, tier);
      await waitForQRRender();

      for (const section of sectionsByTier[tier]) {
        await openAccordion(page, section);
      }
      await assertNoMissingOrDuplicate(page, `editor/${tier}/sections-open`);

      const comboboxes = page.locator('[role="combobox"]');
      const count = await comboboxes.count();
      for (let i = 0; i < count; i++) {
        const combobox = comboboxes.nth(i);
        const visible = await combobox.isVisible().catch(() => false);
        if (!visible) continue;
        await combobox.click({ force: true });
        await assertNoMissingOrDuplicate(page, `editor/${tier}/combobox-${i}-open`);
        await page.keyboard.press('Escape');
      }
    }

    for (const route of [
      '/gallery',
      '/analyze',
      '/guide',
      '/learn',
      '/examples',
      '/about',
      '/privacy',
      '/terms',
      '/contact',
    ]) {
      await page.goto(route);
      await assertNoMissingOrDuplicate(page, route);
    }
  });
});
