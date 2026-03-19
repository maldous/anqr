import type { OutputFormat as GeneratorOutputFormat } from "@/contracts/generator";

export type OutputFormat = Extract<GeneratorOutputFormat, "png" | "webp" | "gif">;
