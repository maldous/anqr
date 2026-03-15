import type { ExporterModule } from './exporter-module';

export const exporterModulePromiseState: {
  current: Promise<ExporterModule> | null;
} = {
  current: null,
};
