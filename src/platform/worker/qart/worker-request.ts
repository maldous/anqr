export type { QArtWorkerGenerateRequest } from "./worker-generate-request.types";
export type { QArtWorkerCancelRequest } from "./worker-cancel-request.types";
import type { QArtWorkerGenerateRequest } from "./worker-generate-request.types";
import type { QArtWorkerCancelRequest } from "./worker-cancel-request.types";
export type QArtWorkerRequest = QArtWorkerGenerateRequest | QArtWorkerCancelRequest;
