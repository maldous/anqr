import { getLoglevelInstance } from './logger-config';
import type { LogLevel } from './logger-types';
import { levels } from './log-levels.const';

export function getLogLevel(): LogLevel {
  return levels[getLoglevelInstance().getLevel()] || 'error';
}
