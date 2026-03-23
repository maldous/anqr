// Canonical public API for @anqr/testing-fakes
export * from "./harness-adapters";

// Scaffold - legacy exports until fakes extraction is complete
export interface ReservedFakesScaffold {
  readonly __reservedFakesScaffold: "reserved";
}
