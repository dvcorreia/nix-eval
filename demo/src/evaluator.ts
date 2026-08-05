import { createEvaluator } from "nix-eval";
import type { Output } from "nix-eval";

export interface EvalStartEvent {
  source: string;
}

export interface EvalEndEvent {
  source: string;
  output: Output;
  duration: number;
}

export interface EvalErrorEvent {
  source: string;
  error: unknown;
}

export type NixEval = (source: string) => Promise<void>;

export async function createNixEvaluator(el: EventTarget): Promise<NixEval> {
  const ev = await createEvaluator();

  return async (source: string): Promise<void> => {
    const start = performance.now();
    el.dispatchEvent(new CustomEvent("eval:start", { detail: { source } }));

    try {
      const output = await ev.eval(source);
      el.dispatchEvent(new CustomEvent("eval:end", {
        detail: { source, output, duration: performance.now() - start },
      }));
    } catch (error) {
      el.dispatchEvent(new CustomEvent("eval:error", {
        detail: { source, error },
      }));
    }
  };
}
