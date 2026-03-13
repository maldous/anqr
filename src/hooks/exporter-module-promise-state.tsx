import type { ExporterModule } from './exporter-module';

let exporterModulePromise: Promise<ExporterModule> | null = null;

export function getExporterModulePromiseState() {
  return exporterModulePromise;
}

export function setExporterModulePromiseState(value: Promise<ExporterModule> | null) {
  exporterModulePromise = value;
}
