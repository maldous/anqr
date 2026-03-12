import { getExporterModulePromise, setExporterModulePromise } from './exporter-module-promise';
import type { ExporterModule } from './exporter-module';

export function loadExporterModule(): Promise<ExporterModule> {
  if (!getExporterModulePromise()) {
    setExporterModulePromise(import('@/modules/exporter') as Promise<ExporterModule>);
  }
  return getExporterModulePromise()!;
}
