import type { SafetyMode } from "@/contracts/generator";

export type GeneratorMetadataEntry = {
  k: string;
  v: string;
};

export type GeneratorMetadataState = {
  title: string;
  author: string;
  copyright: string;
  license: string;
  description: string;
  creationTime: boolean;
  customKv: GeneratorMetadataEntry[];
};

export type GeneratorSafetyState = {
  mode: SafetyMode;
  minModulePx: number;
  minQuietZoneModules: number;
  lockFinders: boolean;
  lockTiming: boolean;
  lockAlign: boolean;
  lockFormat: boolean;
  lockVersion: boolean;
  maxOverlayIntensityByEcc: Record<"L" | "M" | "Q" | "H", number>;
};

export type GeneratorAutoState = {
  pickVersion: boolean;
  pickEcc: boolean;
  reduceIntensityUntilSafe: boolean;
};
