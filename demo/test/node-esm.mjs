import { createEvaluator } from "nix-eval";

const evaluator = await createEvaluator();
const result = await evaluator.eval("6 * 7");

if (result.output !== "42") {
  throw new Error(`Expected 42, received ${JSON.stringify(result)}`);
}
