import type { ExporterModule } from './exporter-module';
import { setExporterModulePromiseState } from './exporter-module-promise-state';

export function setExporterModulePromise(value: Promise<ExporterModule> | null) {
  setExporterModulePromiseState(value);
}
