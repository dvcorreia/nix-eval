import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
  external: ["#wasm/nix_eval.js"],
  output: [
    { file: "dist/index.js", format: "esm" },
    { file: "dist/index.cjs", format: "cjs" },
  ],
});
