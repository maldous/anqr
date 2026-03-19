// Canonical public API for @anqr/domain-render
// Subdirectories (animation, color, core, dither, export, filters, generator, overlay, primitives) are imported directly by consumers.
export type { CanvasFactory } from "./canvas-factory.types";
export type { ModuleStyleOption } from "./module-style-option.types";

export * from "./generator";
export * from "./animation";
export * from "./overlay";
export * from "./filters";
export * from "./dither-algorithms";
export * from "./exporter";
