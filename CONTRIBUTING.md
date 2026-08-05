## Development

Have Nix installed and enter the development shell:

```sh
nix develop
```

Install dependencies from the repository root:

```sh
pnpm install
```

Use the library scripts from the repository root:

```sh
pnpm build
pnpm test
pnpm typecheck
```

The demo has its own dependencies and scripts:

```sh
pnpm --dir demo install
pnpm --dir demo dev
pnpm --dir demo build
pnpm --dir demo test:node:esm
pnpm --dir demo test:node:cjs
```
