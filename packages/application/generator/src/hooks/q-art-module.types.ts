import type { QArtWorkerRuntime } from "../runtime/generator-runtime.types";

type QArtDomainModule = typeof import("@/domain/qr/qart");

export type QArtModule = QArtDomainModule & QArtWorkerRuntime;
