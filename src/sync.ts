import * as wasm from "#wasm/nix_eval.js";
import { parseOutput } from "#src/common.js";
import type { Evaluator, EvaluatorOptions } from "#src/common.js";

let initialized: Promise<void> | undefined;

export async function createEvaluator({ strict = false }: EvaluatorOptions = {}): Promise<Evaluator> {
  initialized ??= Promise.resolve(
    typeof wasm.default === "function" ? wasm.default() : undefined,
  ).then(() => undefined);
  await initialized;

  return {
    async eval(source, location = "/input.nix") {
      return parseOutput(wasm.evaluate(source, location, strict));
    },
  };
}
