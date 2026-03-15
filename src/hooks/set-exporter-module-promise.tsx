import type { ExporterModule } from './exporter-module';
import { exporterModulePromiseState } from './exporter-module-promise-state';

export function setExporterModulePromise(value: Promise<ExporterModule> | null) {
  exporterModulePromiseState.current = value;
}
