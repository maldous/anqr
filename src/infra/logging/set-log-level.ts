import { getLoglevelInstance } from './logger-config';
import type { LogLevel } from './logger-types';

export function setLogLevel(level: LogLevel): void {
  const loglevel = getLoglevelInstance();
  loglevel.setLevel(level);
  for (const name of Object.keys(loglevel.getLoggers())) {
    loglevel.getLogger(name).setLevel(level);
  }
}
