# nix-eval

Evaluate Nix code on the browser with Tvix and WebAssembly.

## Installation

```sh
npm install nix-eval
```

## Usage

Create an evaluator once, then use it to evaluate Nix source. The evaluator
initializes its WebAssembly module on first use.

```ts
import { createEvaluator } from "nix-eval";

const evaluator = await createEvaluator({ strict: true });
const result = await evaluator.eval("6 * 7");

console.log(result.output); // "42"
```

Pass `{ strict: true }` to force the final value before rendering. This resolves
lazy values in attribute sets and lists instead of displaying `<CODE>`.

Pass a location as the second argument to associate diagnostics with a source
name. It defaults to `"<string>"`.

```ts
const result = await evaluator.eval("1 / 0", "example.nix");
console.log(result.errors);
```

## Acknowledgments

This package is based on [Tvix](https://tvix.dev/) and its
[Bolt](https://bolt.tvix.dev/) playground, packaged for distribution as an npm
library. It was also greatly inspired by
[Tour of Nix](https://github.com/nixcloud/tour_of_nix).
