import type { QRGeneratorConfig } from "@/application/generator";
import type { ScenarioFeatureGroup } from "./scenario-feature-group";

export interface GalleryScanScenario {
  id: string;
  title: string;
  description: string;
  featureGroup: ScenarioFeatureGroup;
  heroPriority: number;
  galleryEligible: boolean;
  useOverlay: boolean;
  generatorPatch: Partial<QRGeneratorConfig>;
  galleryParams: Record<string, string | number | boolean>;
}
