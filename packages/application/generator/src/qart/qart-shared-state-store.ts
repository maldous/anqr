import type { QArtModule } from "./qart-shared-types";

export const qartSharedState: {
  modulePromise: Promise<QArtModule> | null;
} = {
  modulePromise: null,
};
