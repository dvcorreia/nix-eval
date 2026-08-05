const { createEvaluator } = require("nix-eval");

createEvaluator()
  .then((evaluator) => evaluator.eval("6 * 7"))
  .then((result) => {
    if (result.output !== "42") {
      throw new Error(`Expected 42, received ${JSON.stringify(result)}`);
    }
  });
