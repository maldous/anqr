import { getLoglevelInstance } from './logger-loglevel-instance';
import { defaultLevel } from './logger-default-level';

getLoglevelInstance().setLevel(defaultLevel);

export { defaultLevel } from './logger-default-level';
export { isLevelEnabledForLogger } from './logger-console-check';
export { getLoglevelInstance } from './logger-loglevel-instance';
export { shouldCaptureStructured } from './logger-structured-capture';
