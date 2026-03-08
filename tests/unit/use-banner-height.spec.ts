import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

let isNativeMock = false;

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativeMock },
}));

const unsubscribeMock = vi.fn();
let capturedCallback: ((height: number) => void) | null = null;

vi.mock('@/modules/platform', () => ({
  onBannerHeightChange: vi.fn((cb: (height: number) => void) => {
    capturedCallback = cb;
    return unsubscribeMock;
  }),
}));

import { useBannerHeight } from '../../src/hooks/useBannerHeight';

describe('useBannerHeight hook', () => {
  let container: HTMLDivElement;
  let root: Root;
  let lastHeight: number;

  function TestComponent() {
    lastHeight = useBannerHeight();
    return null;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;
    lastHeight = -1;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('returns 0 on web platform', async () => {
    isNativeMock = false;

    await act(async () => {
      root.render(createElement(TestComponent));
    });

    expect(lastHeight).toBe(0);
    expect(capturedCallback).toBeNull();
  });

  it('sets initial height estimate and subscribes on native platform', async () => {
    isNativeMock = true;

    await act(async () => {
      root.render(createElement(TestComponent));
    });

    expect(lastHeight).toBe(60);
    expect(capturedCallback).not.toBeNull();
  });

  it('updates height when banner size changes on native', async () => {
    isNativeMock = true;

    await act(async () => {
      root.render(createElement(TestComponent));
    });

    expect(lastHeight).toBe(60);

    await act(async () => {
      capturedCallback!(90);
    });

    expect(lastHeight).toBe(90);
  });

  it('calls unsubscribe on unmount', async () => {
    isNativeMock = true;

    await act(async () => {
      root.render(createElement(TestComponent));
    });

    expect(unsubscribeMock).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });

    expect(unsubscribeMock).toHaveBeenCalledOnce();

    // Re-create root for afterEach cleanup
    root = createRoot(container);
  });
});
