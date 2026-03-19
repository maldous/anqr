type QArtDomainModule = typeof import("@/modules/qart");
type QArtWorkerModule = Pick<
  typeof import("@/platform/worker"),
  "generateQArtInWorker" | "terminateQArtWorker"
>;

export type QArtModule = QArtDomainModule & QArtWorkerModule;
