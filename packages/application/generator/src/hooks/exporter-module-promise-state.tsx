import type { ExporterModule } from "../export/exporter-module.types";

export const exporterModulePromiseState: {
  current: Promise<ExporterModule> | null;
} = {
  current: null,
};
