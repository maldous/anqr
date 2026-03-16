import { getQartModulePromise, setQartModulePromise } from "./qart-module-promise";
import type { QArtModule } from "./q-art-module";

export function loadQArtModule(): Promise<QArtModule> {
  if (!getQartModulePromise()) {
    setQartModulePromise(import("@/modules/qr-art") as Promise<QArtModule>);
  }
  return getQartModulePromise()!;
}
