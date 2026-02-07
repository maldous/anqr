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

const prefixMock = {
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

let currentLevel = 1; // debug
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
vi.mock('loglevel-plugin-prefix', () => ({ default: prefixMock }));
vi.mock('loglevel', () => ({ default: loglevelMock }));

describe('logger buffer redaction (security)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    currentLevel = 1;
    for (const key of Object.keys(levelLoggers)) delete levelLoggers[key];
  });

  it('redacts sensitive data in structured buffer for trace level', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.trace('auth attempt', { token: 'secret-token-123', userId: 'user1' });

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(1);
    const entry = logs[0];
    expect(entry.scope).toBe('TEST');
    expect(entry.level).toBe('trace');
    expect(entry.message).toBe('auth attempt');
    // Token MUST be redacted in the structured buffer
    const ctx = entry.context as Record<string, unknown>;
    expect(ctx.token).toBe('[REDACTED]');
    expect(ctx.userId).toBe('user1');
  });

  it('redacts sensitive data in structured buffer for debug level', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.debug('login', { password: 'my-password', username: 'alice' });

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(1);
    const ctx = logs[0].context as Record<string, unknown>;
    expect(ctx.password).toBe('[REDACTED]');
    expect(ctx.username).toBe('alice');
  });

  it('redacts sensitive data in structured buffer for info level', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.info('session created', { accessToken: 'tok-abc', scope: 'read' });

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(1);
    const ctx = logs[0].context as Record<string, unknown>;
    expect(ctx.accessToken).toBe('[REDACTED]');
    expect(ctx.scope).toBe('read');
  });

  it('redacts sensitive data in structured buffer for warn level', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.warn('expiring', { refreshToken: 'rt-xyz', ttl: 300 });

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(1);
    const ctx = logs[0].context as Record<string, unknown>;
    expect(ctx.refreshToken).toBe('[REDACTED]');
    expect(ctx.ttl).toBe(300);
  });

  it('redacts sensitive data in structured buffer for error level', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.error('auth failed', { apiKey: 'key-123', endpoint: '/api' });

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(1);
    const ctx = logs[0].context as Record<string, unknown>;
    expect(ctx.apiKey).toBe('[REDACTED]');
    expect(ctx.endpoint).toBe('/api');
  });

  it('redacts nested sensitive data in structured buffer for all levels', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    const sensitiveCtx = {
      user: { name: 'alice', credential: 'cred-secret' },
      config: { api_key: 'k123', host: 'example.com' },
    };

    log.trace('nested trace', sensitiveCtx);
    log.debug('nested debug', sensitiveCtx);
    log.info('nested info', sensitiveCtx);

    const logs = mod.getStructuredLogs();
    expect(logs).toHaveLength(3);

    for (const entry of logs) {
      const ctx = entry.context as Record<string, any>;
      expect(ctx.user.credential).toBe('[REDACTED]');
      expect(ctx.user.name).toBe('alice');
      expect(ctx.config.api_key).toBe('[REDACTED]');
      expect(ctx.config.host).toBe('example.com');
    }
  });

  it('redacts sensitive data in string buffer for trace/debug/info', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    mod.enableLogBuffer();
    const log = mod.createLogger('TEST');

    log.trace('t', { secret: 'shhh', ok: 1 });
    log.debug('d', { token: 'tok', ok: 2 });
    log.info('i', { password: 'pw', ok: 3 });

    const flushed = mod.flushLogBuffer();
    mod.disableLogBuffer();

    // Sensitive values must NOT appear in the string buffer
    expect(flushed).not.toContain('shhh');
    expect(flushed).not.toContain('secret=shhh');
    expect(flushed).not.toContain('token=tok');
    expect(flushed).not.toContain('password=pw');
    // But safe values should be present
    expect(flushed).toContain('ok=1');
    expect(flushed).toContain('ok=2');
    expect(flushed).toContain('ok=3');
    // Redaction markers should appear
    expect(flushed).toContain('[REDACTED]');
  });

  it('handles all known sensitive key names', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    const allSensitive = {
      password: 'p1',
      token: 'p2',
      secret: 'p3',
      apiKey: 'p4',
      api_key: 'p5',
      authorization: 'p6',
      auth: 'p7',
      credential: 'p8',
      sessionId: 'p9',
      session_id: 'p10',
      accessToken: 'p11',
      access_token: 'p12',
      refreshToken: 'p13',
      refresh_token: 'p14',
      privateKey: 'p15',
      private_key: 'p16',
      safeKey: 'visible',
    };

    log.debug('all keys', allSensitive);

    const logs = mod.getStructuredLogs();
    const ctx = logs[0].context as Record<string, unknown>;
    // All sensitive keys should be redacted
    for (const key of Object.keys(allSensitive)) {
      if (key === 'safeKey') {
        expect(ctx[key]).toBe('visible');
      } else {
        expect(ctx[key]).toBe('[REDACTED]');
      }
    }
  });

  it('filterLogs works correctly', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();

    const logA = mod.createLogger('ALPHA');
    const logB = mod.createLogger('BETA');

    logA.debug('a1');
    logB.debug('b1');
    logA.info('a2');

    expect(mod.filterLogs('alpha')).toHaveLength(2);
    expect(mod.filterLogs('BETA')).toHaveLength(1);
    expect(mod.filterLogs('GAMMA')).toHaveLength(0);
  });

  it('filterLogsByScopes works correctly', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();

    const logA = mod.createLogger('ALPHA');
    const logB = mod.createLogger('BETA');
    const logC = mod.createLogger('GAMMA');

    logA.debug('a');
    logB.debug('b');
    logC.debug('c');

    expect(mod.filterLogsByScopes(['ALPHA', 'GAMMA'])).toHaveLength(2);
    expect(mod.filterLogsByScopes(['beta'])).toHaveLength(1);
    expect(mod.filterLogsByScopes([])).toHaveLength(0);
  });

  it('filterLogsByLevel works correctly', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    log.trace('t');
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');

    expect(mod.filterLogsByLevel(['trace'])).toHaveLength(1);
    expect(mod.filterLogsByLevel(['warn', 'error'])).toHaveLength(2);
    expect(mod.filterLogsByLevel(['DEBUG'])).toHaveLength(1);
  });

  it('getStructuredLogCount returns correct count', async () => {
    const mod = await import('../../src/lib/logger');
    mod.clearStructuredLogs();
    const log = mod.createLogger('TEST');

    expect(mod.getStructuredLogCount()).toBe(0);
    log.debug('one');
    expect(mod.getStructuredLogCount()).toBe(1);
    log.info('two');
    expect(mod.getStructuredLogCount()).toBe(2);
    mod.clearStructuredLogs();
    expect(mod.getStructuredLogCount()).toBe(0);
  });
});
