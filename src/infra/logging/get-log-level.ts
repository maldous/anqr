import { getLoglevelInstance } from './logger-config';
import type { LogLevel } from './logger-types';

const levels: Record<number, LogLevel> = {
  0: 'trace',
  1: 'debug',
  2: 'info',
  3: 'warn',
  4: 'error',
  5: 'silent',
};

export function getLogLevel(): LogLevel {
  return levels[getLoglevelInstance().getLevel()] || 'error';
}
