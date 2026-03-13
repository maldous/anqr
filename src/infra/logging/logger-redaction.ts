import { MAX_CONTEXT_DEPTH } from './logger-state';
import type { LogContext } from './logger-types';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'sessionid',
  'session_id',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'privatekey',
  'private_key',
]);

const REDACTED = '[REDACTED]';

export function redactSensitive(obj: unknown, depth = 0): unknown {
  if (depth > MAX_CONTEXT_DEPTH) return '[MAX_DEPTH]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, depth + 1));
  }

  if (obj instanceof Error) return obj;
  if (obj instanceof Set || obj instanceof Map) return obj;
  if (typeof Node !== 'undefined' && obj instanceof Node) return obj;
  if (ArrayBuffer.isView(obj)) return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
      ? REDACTED
      : redactSensitive(value, depth + 1);
  }
  return result;
}

export function sanitizeLogContext(context?: LogContext): LogContext | undefined {
  return context ? (redactSensitive(context) as LogContext) : undefined;
}
