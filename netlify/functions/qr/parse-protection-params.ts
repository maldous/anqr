import { ParsedHandlerParams } from "./parsed-handler-params.types";

export function parseProtectionParams(
  params: URLSearchParams,
): Pick<
  ParsedHandlerParams,
  | "preserveFinders"
  | "preserveTiming"
  | "preserveAlignment"
  | "protectFormatInfo"
  | "protectVersionInfo"
  | "eccAwareEnabled"
  | "eccAwareRiskBudget"
  | "eccAwareWeightMap"
  | "lockFinders"
  | "lockTiming"
  | "lockAlign"
  | "lockFormat"
  | "lockVersion"
  | "safetyMode"
  | "safetyMinModulePx"
  | "safetyMinQuietZone"
  | "autoPickVersion"
  | "autoPickEcc"
  | "autoReduceIntensity"
> {
  void params.get("qaContrast"); // NOSONAR - intentional void to suppress floating promise
  void params.get("qaBlur"); // NOSONAR - intentional void to suppress floating promise
  void params.get("qaNoise"); // NOSONAR - intentional void to suppress floating promise
  void params.get("qaRot"); // NOSONAR - intentional void to suppress floating promise
  void params.get("qaHeatmap"); // NOSONAR - intentional void to suppress floating promise
  return {
    preserveFinders: params.get("keepFinders") !== "0",
    preserveTiming: params.get("keepTiming") === "1",
    preserveAlignment: params.get("keepAlign") === "1",
    protectFormatInfo: params.get("protectFmt") === "1",
    protectVersionInfo: params.get("protectVer") === "1",
    eccAwareEnabled: params.get("eccAware") === "1",
    eccAwareRiskBudget: Math.min(
      100,
      Math.max(0, Number.parseInt(params.get("eccRisk") || "50", 10)),
    ),
    eccAwareWeightMap: params.get("eccMap") || "distance_to_finders",
    lockFinders: params.get("lockF") !== "0",
    lockTiming: params.get("lockT") !== "0",
    lockAlign: params.get("lockA") !== "0",
    lockFormat: params.get("lockFmt") !== "0",
    lockVersion: params.get("lockV") !== "0",
    safetyMode: params.get("safeMode") || "off",
    safetyMinModulePx: Number.parseInt(params.get("safeMinPx") || "2", 10),
    safetyMinQuietZone: Number.parseInt(params.get("safeMinQz") || "4", 10),
    autoPickVersion: params.get("autoVer") !== "0",
    autoPickEcc: params.get("autoEcc") === "1",
    autoReduceIntensity: params.get("autoReduce") === "1",
  };
}
