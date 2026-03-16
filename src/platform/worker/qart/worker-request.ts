export type { QArtWorkerGenerateRequest } from "./worker-generate-request.interface";
export type { QArtWorkerCancelRequest } from "./worker-cancel-request.interface";
import type { QArtWorkerGenerateRequest } from "./worker-generate-request.interface";
import type { QArtWorkerCancelRequest } from "./worker-cancel-request.interface";
export type QArtWorkerRequest = QArtWorkerGenerateRequest | QArtWorkerCancelRequest;
