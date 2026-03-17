import { exporterModulePromiseState } from "./exporter-module-promise-state";

export function getExporterModulePromise() {
  return exporterModulePromiseState.current;
}
