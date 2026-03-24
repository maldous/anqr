export interface ModelsListOutput {
  count: number;
  models: Array<{
    key: string;
    name: string;
    input: string;
    contextWindow: number;
    local: boolean;
    available: boolean;
    tags: string[];
    missing: boolean;
  }>;
}

export interface ModelsStatusOutput {
  configPath: string;
  defaultModel: string;
  resolvedDefault: string;
  fallbacks: string[];
  allowed: string[];
  imageModel: string | null;
  imageFallbacks: string[];
}

export interface TuiPexpectResult {
  connected: boolean;
  running: boolean;
  idle: boolean;
  modelInfo: string;
  tokenInfo: string;
  rawLength: number;
  elapsed: number;
  error: string;
}
