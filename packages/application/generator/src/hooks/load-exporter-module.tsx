import { getExporterModulePromise, setExporterModulePromise } from "./exporter-module-promise";
import { browserExporterModule } from "./browser-exporter-module";
import type { ExporterModule } from "../export/exporter-module.types";

export function loadExporterModule(): Promise<ExporterModule> {
  if (!getExporterModulePromise()) {
    setExporterModulePromise(Promise.resolve(browserExporterModule));
  }
  return getExporterModulePromise()!;
}
