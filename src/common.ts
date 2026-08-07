export type Output = {
  errors: string;
  warnings: string;
  output: string;
  bytecode: string;
  trace: string;
  ast: string;
};

export type EvaluatorOptions = {
  strict?: boolean;
};

export interface Evaluator {
  eval(source: string, location?: string): Promise<Output>;
}

const outputFields = [
  "errors",
  "warnings",
  "output",
  "bytecode",
  "trace",
  "ast",
] as const;

export function parseOutput(value: string): Output {
  const output: unknown = JSON.parse(value);
  if (!isOutput(output)) {
    throw new Error("wasm evaluator returned invalid output");
  }

  return output;
}

function isOutput(value: unknown): value is Output {
  const output = value as Record<string, unknown>;

  return (
    typeof value === "object" &&
    value !== null &&
    outputFields.every((field) => typeof output[field] === "string")
  );
}
