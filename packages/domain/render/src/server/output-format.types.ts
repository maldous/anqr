import type { OutputFormat as GeneratorOutputFormat } from "@/domain/share";

export type OutputFormat = Extract<GeneratorOutputFormat, "png" | "webp" | "gif">;
