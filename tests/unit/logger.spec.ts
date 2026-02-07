// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sentry = {
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((cb: (scope: any) => void) => {
    const scope = {
      setTag: vi.fn(),
      setExtras: vi.fn(),
      setExtra: vi.fn(),
    };
    cb(scope);
  }),
};

const prefix = {
  reg: vi.fn(),
  apply: vi.fn(),
};

const levelByName: Record<string, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

function createLevelLogger(name: string) {
  return {
    name,
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
  };
}

let currentLevel = 4;
const levelLoggers: Record<string, ReturnType<typeof createLevelLogger>> = {};
const loglevelMock = {
  setLevel: vi.fn((level: string | number) => {
    currentLevel = typeof level === 'number' ? level : (levelByName[level] ?? 4);
  }),
  getLevel: vi.fn(() => currentLevel),
  getLogger: vi.fn((name: string) => {
    if (!levelLoggers[name]) levelLoggers[name] = createLevelLogger(name);
    return levelLoggers[name];
  }),
  getLoggers: vi.fn(() => levelLoggers),
};

vi.mock('@sentry/react', () => sentry);
vi.mock('loglevel-plugin-prefix', () => ({ default: prefix }));
vi.mock('loglevel', () => ({ default: loglevelMock }));

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    currentLevel = 4;
    for (const key of Object.keys(levelLoggers)) delete levelLoggers[key];
    document.body.innerHTML = '';
    vi.stubGlobal('structuredClone', globalThis.structuredClone);
  });

  it('creates scoped logger, redacts sensitive context and reports to sentry', async () => {
    const mod = await import('../../src/lib/logger');
    const log = mod.createLogger('diag');

    const err = new Error('boom');
    log.warn('warn-msg', { token: 'abc', safe: 1 });
    log.error('err-msg', { error: err, password: 'pw', nested: { secret: 'x' } });

    const logger = levelLoggers.DIAG;
    expect(logger).toBeTruthy();
    expect(logger.setLevel).toHaveBeenCalled();

    const warnCtx = logger.warn.mock.calls[0][1];
    expect(warnCtx).toMatchObject({ token: '[REDACTED]', safe: 1 });
    expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'DIAG', message: 'warn-msg', level: 'warning' })
    );

    expect(sentry.withScope).toHaveBeenCalledTimes(1);
    expect(sentry.captureException).toHaveBeenCalledWith(err);
    const errCtx = logger.error.mock.calls[0][1];
    expect(errCtx).toMatchObject({ password: '[REDACTED]', nested: { secret: '[REDACTED]' } });
  });

  it('captures logs in string and structured buffers and serializes fallback types', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    mod.enableLogBuffer();
    const log = mod.createLogger('qart');

    const node = document.createTextNode('x');
    const elem = document.createElement('button');
    const ctx = {
      fn: () => 'x',
      err: new Error('x'),
      set: new Set([1, 2]),
      map: new Map([['k', 1]]),
      node,
      elem,
      bytes: new Uint8Array([1, 2, 3]),
    };

    log.debug('dbg', ctx as any);

    expect(mod.getBufferSize()).toBe(1);
    const flushed = mod.flushLogBuffer();
    expect(flushed).toContain('[QART:debug] dbg');
    expect(mod.getBufferSize()).toBe(0);

    const structured = mod.getStructuredLogs();
    expect(structured).toHaveLength(1);
    expect(structured[0].scope).toBe('QART');
    expect(structured[0].context).toMatchObject({
      fn: '[Function]',
      err: { __type: 'Error', message: 'x' },
      set: { __type: 'Set', values: [1, 2] },
      map: { __type: 'Map', entries: [['k', 1]] },
      node: '[Node: #text]',
      elem: '[HTMLElement: BUTTON]',
      bytes: { __type: 'Uint8Array', values: [1, 2, 3] },
    });
  });

  it('saves all logs and filtered logs to downloads and handles empty buffer', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const q = mod.createLogger('QART');
    const o = mod.createLogger('OVERLAY');
    q.info('q1', { ok: true });
    o.warn('w1');

    mod.saveLogs('all.json');
    mod.saveFilteredLogs('QART', 'qart.json');
    mod.clearStructuredLogs();
    mod.saveLogs('empty.json');
    mod.saveFilteredLogs('QART', 'none.json');

    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No logs to save'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No logs found for scope'));

    clickSpy.mockRestore();
    consoleSpy.mockRestore();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it('updates and resets log levels across child loggers', async () => {
    const mod = await import('../../src/lib/logger');

    mod.createLogger('ONE');
    mod.createLogger('TWO');

    mod.setLogLevel('trace');
    expect(mod.getLogLevel()).toBe('trace');

    expect(levelLoggers.ONE.setLevel).toHaveBeenCalledWith('trace');
    expect(levelLoggers.TWO.setLevel).toHaveBeenCalledWith('trace');

    mod.resetLogLevel();
    expect(mod.getLogLevel()).toBe('debug');

    // import-time setup applied prefix plugin
    expect(prefix.reg).toHaveBeenCalled();
    expect(prefix.apply).toHaveBeenCalled();
  });
});
