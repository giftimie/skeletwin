import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  platform: "neutral",
  target: "es2022",
  deps: { neverBundle: ["react", "react/jsx-runtime"] },
  // Rolldown preserves entry directives. The distribution check verifies both output formats.
  checks: { moduleLevelDirective: false },
});
