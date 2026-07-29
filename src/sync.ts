import init, { eval as evalWasm } from "../wasm/nix_eval.js";
import { parseOutput } from "./common.js";
import type { Evaluator } from "./common.js";

let initialized: Promise<void> | undefined;

export async function createEvaluator(): Promise<Evaluator> {
  initialized ??= init().then(() => undefined);
  await initialized;

  return {
    async eval(source, location = "/input.nix") {
      return parseOutput(evalWasm(source, location));
    },
  };
}
