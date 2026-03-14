export type { QArtWorkerProgressMessage } from './worker-progress-message.interface';
export type { QArtWorkerResultMessage } from './worker-result-message.interface';
import type { QArtWorkerProgressMessage } from './worker-progress-message.interface';
import type { QArtWorkerResultMessage } from './worker-result-message.interface';
export type QArtWorkerMessage = QArtWorkerProgressMessage | QArtWorkerResultMessage;
