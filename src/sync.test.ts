import { describe, expect, it, vi } from "vitest";

vi.mock("#wasm/nix_eval.js", () => ({
  default: vi.fn().mockResolvedValue(undefined),
  eval: vi.fn((source: string, _location: string) =>
    JSON.stringify({
      errors: "",
      warnings: "",
      output: source === "6 * 7" ? "42" : "",
      bytecode: "bytecode",
      trace: "trace",
      ast: "ast",
    }),
  ),
}));

import { createEvaluator } from "#src/sync.js";

describe("createEvaluator", () => {
  it("returns an evaluator with an eval function", async () => {
    const evaluator = await createEvaluator();
    expect(evaluator).toHaveProperty("eval");
    expect(typeof evaluator.eval).toBe("function");
  });

  it("initializes WASM only once", async () => {
    const mod = await import("#wasm/nix_eval.js");
    const init = mod.default as ReturnType<typeof vi.fn>;

    await createEvaluator();
    await createEvaluator();

    expect(init).toHaveBeenCalledTimes(1);
  });

  it("evaluates Nix source through the WASM binding", async () => {
    const evaluator = await createEvaluator();
    const result = await evaluator.eval("6 * 7");

    expect(result.output).toBe("42");
    expect(result.errors).toBe("");
  });
});
