import type { StructuredLogEntry } from './logger-types';

export const MAX_BUFFER_SIZE = 2000;
export const MAX_STRUCTURED_BUFFER_SIZE = 5000;
export const MAX_CONTEXT_DEPTH = 10;

export const loggerState: {
  logBufferEnabled: boolean;
  logBuffer: string[];
  structuredLogBuffer: StructuredLogEntry[];
} = {
  logBufferEnabled: false,
  logBuffer: [],
  structuredLogBuffer: [],
};
