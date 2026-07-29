import { describe, expect, it } from "vitest";

import { parseOutput } from "#src/common.js";

const output = {
  errors: "",
  warnings: "",
  output: "42",
  bytecode: "bytecode",
  trace: "trace",
  ast: "ast",
};

describe("parseOutput", () => {
  it("returns a valid evaluator output", () => {
    expect(parseOutput(JSON.stringify(output))).toEqual(output);
  });

  it("rejects malformed JSON", () => {
    expect(() => parseOutput("not json")).toThrow(SyntaxError);
  });

  it("rejects missing and non-string output fields", () => {
    expect(() => parseOutput(JSON.stringify({ ...output, ast: undefined }))).toThrow(
      "wasm evaluator returned invalid output",
    );
    expect(() => parseOutput(JSON.stringify({ ...output, output: 42 }))).toThrow(
      "wasm evaluator returned invalid output",
    );
  });
});
