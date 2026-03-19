import { getQartModulePromise, setQartModulePromise } from "./qart-module-promise";
import type { QArtModule } from "./q-art-module";
import { getQArtWorkerRuntime } from "../runtime/generator-runtime";

export function loadQArtModule(): Promise<QArtModule> {
  if (!getQartModulePromise()) {
    setQartModulePromise(
      import("@/domain/qr/qart").then((qartModule) => ({
          ...qartModule,
          ...getQArtWorkerRuntime(),
        })),
    );
  }
  return getQartModulePromise()!;
}
