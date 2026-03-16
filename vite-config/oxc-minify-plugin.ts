import { minifySync } from "oxc-minify";

export function oxcMinifyPlugin() {
  return {
    name: "oxc-minify",
    apply: "build" as const,
    enforce: "post" as const,
    renderChunk(code: string, chunk: { fileName: string }) {
      const result = minifySync(chunk.fileName, code, {
        module: true,
        compress: {
          target: "es2020",
          dropConsole: true,
          dropDebugger: true,
          treeshake: {
            manualPureFunctions: ["console.log", "console.info", "console.debug", "console.warn"],
          },
        },
        mangle: true,
        codegen: { removeWhitespace: true },
        sourcemap: true,
      });
      if (result.errors.length > 0) {
        throw new Error(
          `oxc-minify errors in ${chunk.fileName}: ${result.errors.map((e) => e.message).join(", ")}`,
        );
      }
      return {
        code: result.code,
        map: result.map ?? null,
      };
    },
  };
}
