import { defaultLevel } from './logger-default-level';
import { isLevelEnabledForLogger } from './logger-console-check';
import { getLoglevelInstance } from './logger-loglevel-instance';
import { shouldCaptureStructured } from './logger-structured-capture';

getLoglevelInstance().setLevel(defaultLevel);

export { defaultLevel, getLoglevelInstance, isLevelEnabledForLogger, shouldCaptureStructured };
