import type { ExporterModule } from './exporter-module';

let exporterModulePromise: Promise<ExporterModule> | null = null;
export function getExporterModulePromise() { return exporterModulePromise; }
export function setExporterModulePromise(v: Promise<ExporterModule> | null) { exporterModulePromise = v; }
