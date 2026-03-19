import type { ExporterModule } from "../export/exporter-module.types";
import { exporterModulePromiseState } from "./exporter-module-promise-state";

export function setExporterModulePromise(value: Promise<ExporterModule> | null) {
  exporterModulePromiseState.current = value;
}
