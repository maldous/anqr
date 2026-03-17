export type IubendaWindow = Window & {
  _iub?: Array<Record<string, unknown>> & { csConfiguration?: Record<string, unknown> };
  __anqrWebAssetsLoaded?: boolean;
};
