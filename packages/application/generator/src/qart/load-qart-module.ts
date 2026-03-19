import type { QArtModule } from "./qart-shared-types";
import { qartSharedState } from "./qart-shared-state-store";
import { getQArtWorkerRuntime } from "../runtime/generator-runtime";

export function loadQArtModule(): Promise<QArtModule> {
  qartSharedState.modulePromise ??= import("@/domain/qr/qart").then((qartModule) => ({
    ...qartModule,
    ...getQArtWorkerRuntime(),
  }));
  return qartSharedState.modulePromise;
}
