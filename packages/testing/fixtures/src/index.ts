// Canonical public API for @anqr/testing-fixtures
export * from "./harness-scenarios";

// Scaffold - legacy exports until fixture extraction is complete
export interface ReservedFixturesScaffold {
  readonly __reservedFixturesScaffold: "reserved";
}
