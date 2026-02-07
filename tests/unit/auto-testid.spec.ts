// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { initAutoDynamicTestIds } from '../../src/lib/auto-testid';

const REGISTRY_KEY = '__ANQR_DYNAMIC_TESTID_REGISTRY__';

describe('auto-testid', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete (globalThis as any)[REGISTRY_KEY];
  });

  it('assigns test ids to interactive elements and keeps existing ids', () => {
    document.body.innerHTML = `
      <button aria-label="Save">Save</button>
      <input name="email" />
      <a href="/x">Link</a>
      <button data-testid="export-button">Has Existing</button>
    `;

    initAutoDynamicTestIds();

    const [btn, input, link, existing] = Array.from(document.querySelectorAll('button,input,a'));
    expect(btn.getAttribute('data-testid')).toMatch(/^auto-button-save/);
    expect(input.getAttribute('data-testid')).toMatch(/^auto-input-email/);
    expect(link.getAttribute('data-testid')).toMatch(/^auto-a-link/);
    expect(existing.getAttribute('data-testid')).toBe('export-button');

    expect(btn.getAttribute('data-auto-testid-key')).toBeTruthy();
    expect(input.getAttribute('data-auto-testid-key')).toBeTruthy();
  });

  it('observes added nodes and uses stable source keys', async () => {
    document.body.innerHTML = `<button title="Primary Action">Go</button>`;
    initAutoDynamicTestIds();

    const root = document.createElement('div');
    root.innerHTML = `<div><button title="Primary Action">Go</button></div>`;
    document.body.appendChild(root);

    await Promise.resolve();

    const buttons = Array.from(document.querySelectorAll('button'));
    expect(buttons[0].getAttribute('data-testid')).toMatch(/^auto-button-primary-action/);
    expect(buttons[1].getAttribute('data-testid')).toMatch(/^auto-button-primary-action-/);

    const original = buttons[0].getAttribute('data-testid');
    // Re-run initializer and verify existing key keeps same resolved id.
    initAutoDynamicTestIds();
    expect(buttons[0].getAttribute('data-testid')).toBe(original);
  });
});
