// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loggerApi = {
  clearStructuredLogs: vi.fn(),
  createLogger: vi.fn(() => ({ info: vi.fn() })),
  filterLogs: vi.fn(() => [{ id: 1 }]),
  filterLogsByLevel: vi.fn(() => [{ id: 2 }]),
  filterLogsByScopes: vi.fn(() => [{ id: 3 }]),
  getLogLevel: vi.fn(() => 'error'),
  getStructuredLogCount: vi.fn(() => 42),
  getStructuredLogs: vi.fn(() => [{ id: 7 }]),
  resetLogLevel: vi.fn(),
  saveFilteredLogs: vi.fn(),
  saveLogs: vi.fn(),
  setLogLevel: vi.fn(),
};

vi.mock('../../src/lib/logger', () => loggerApi);

describe('logger-remote', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    delete (window as Window & { anqrDiag?: unknown }).anqrDiag;
  });

  it('enables diagnostics with ttl clamp and disable resets state', async () => {
    const mod = await import('../../src/lib/logger-remote');

    mod.enableDiagnostics(999, 'manual test');
    expect(loggerApi.setLogLevel).toHaveBeenCalledWith('debug');

    const raw = localStorage.getItem('anqr_diagnostics');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.enabled).toBe(true);
    expect(parsed.reason).toBe('manual test');
    expect(parsed.expiresAt - parsed.enabledAt).toBe(120 * 60 * 1000);

    const status = mod.getDiagnosticsStatus();
    expect(status.enabled).toBe(true);
    expect(status.reason).toBe('manual test');

    mod.disableDiagnostics();
    expect(localStorage.getItem('anqr_diagnostics')).toBeNull();
    expect(loggerApi.resetLogLevel).toHaveBeenCalled();
  });

  it('expires invalid state and initializes window API methods', async () => {
    const now = Date.now();
    localStorage.setItem(
      'anqr_diagnostics',
      JSON.stringify({
        enabled: true,
        enabledAt: now - 60000,
        expiresAt: now - 1,
        reason: 'expired',
      })
    );

    const mod = await import('../../src/lib/logger-remote');
    mod.initRemoteDiagnostics();

    expect(localStorage.getItem('anqr_diagnostics')).toBeNull();
    expect(window.anqrDiag).toBeTruthy();

    const api = window.anqrDiag as {
      status: () => unknown;
      saveLogs: (name?: string) => void;
      saveQartLogs: (name?: string) => void;
      saveByScope: (scope: string, filename?: string) => void;
      getLogs: () => unknown;
      getQartLogs: () => unknown;
      getLogsByScope: (scope: string) => unknown;
      getLogsByScopes: (scopes: string[]) => unknown;
      getErrors: () => unknown;
      clearLogs: () => void;
      logCount: () => number;
      help: () => void;
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(api.status()).toMatchObject({ enabled: false, currentLevel: 'error' });

    api.saveLogs('a.json');
    api.saveQartLogs('q.json');
    api.saveByScope('OVERLAY', 'o.json');
    expect(loggerApi.saveLogs).toHaveBeenCalledWith('a.json');
    expect(loggerApi.saveFilteredLogs).toHaveBeenCalledWith('QART', 'q.json');
    expect(loggerApi.saveFilteredLogs).toHaveBeenCalledWith('OVERLAY', 'o.json');

    expect(api.getLogs()).toEqual([{ id: 7 }]);
    expect(api.getQartLogs()).toEqual([{ id: 1 }]);
    expect(api.getLogsByScope('DIAG')).toEqual([{ id: 1 }]);
    expect(api.getLogsByScopes(['QART', 'OVERLAY'])).toEqual([{ id: 3 }]);
    expect(api.getErrors()).toEqual([{ id: 2 }]);

    api.clearLogs();
    expect(loggerApi.clearStructuredLogs).toHaveBeenCalled();
    expect(api.logCount()).toBe(42);

    api.help();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('restores valid diagnostics on startup and handles bad stored json', async () => {
    localStorage.setItem('anqr_diagnostics', 'not-json');
    const mod = await import('../../src/lib/logger-remote');
    expect(mod.getDiagnosticsStatus().enabled).toBe(false);

    const now = Date.now();
    localStorage.setItem(
      'anqr_diagnostics',
      JSON.stringify({
        enabled: true,
        enabledAt: now - 1000,
        expiresAt: now + 20 * 60000,
        reason: 'persist',
      })
    );

    mod.initRemoteDiagnostics();
    expect(loggerApi.setLogLevel).toHaveBeenCalledWith('debug');
    expect(mod.getDiagnosticsStatus().enabled).toBe(true);
    expect(mod.getDiagnosticsStatus().remainingMinutes).toBeGreaterThan(0);
  });
});
