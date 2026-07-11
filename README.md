# @zoldytech/eslint-config

Shared **SonarQube-equivalent** ESLint flat-config guardrails for four stacks — **Next.js**,
**NestJS**, **React + Vite**, and **plain JS/TS**. One package so every project imports the same
bar instead of re-deriving it: the full `eslint-plugin-sonarjs` recommended set, cognitive
complexity capped at 15, plus curated `unicorn`/core rules mapped to the SonarQube S-codes the
sonarjs plugin doesn't ship (S7781, S7763, S6606, S7735, …), and a `unused-imports` de-dup layer.

Also ships a shared Prettier config and TypeScript base configs.

## Requirements

- **Node** ≥ 20.10
- **ESLint ≥ 9.38** — this line targets ESLint **9** today. The config is already ESLint-10-ready;
  a 10-targeting release follows once `eslint-plugin-react` / `eslint-config-next` declare an
  ESLint 10 peer (until then, ESLint 10 forces `legacy-peer-deps` on install). See
  [ESLint 10](#eslint-10).
- **TypeScript** ≥ 5 (peer)

## Install

Distributed via GitHub URL, pinned to a tag:

```bash
npm i -D "github:zoldytech/eslint-config#v0.1.0"
```

This adds `"@zoldytech/eslint-config": "github:zoldytech/eslint-config#v0.1.0"` to your
`devDependencies`. No build step runs on install (raw ESM).

> **Footprint note:** `eslint-config-next` is a regular dependency (so the `next` preset works
> after you install only the `next` package). It is loaded lazily — importing the barrel does not
> execute it — but it is still _installed_ for every consumer, including plain-JS/Nest projects that
> never use the `next` preset. That's a deliberate simplicity trade; a future split into
> per-framework packages is possible if the install weight matters.

## Usage

Each preset is a function returning a flat-config array. Call it in your `eslint.config.mjs` and
spread the result; append your own `globalIgnores` and any project overrides.

### Next.js

```js
import { next } from '@zoldytech/eslint-config/eslint';
import { globalIgnores } from 'eslint/config';

export default [...next({ typeChecked: true }), globalIgnores(['.next/**', 'coverage/**'])];
```

### NestJS

```js
import { nest } from '@zoldytech/eslint-config/eslint';
import { globalIgnores } from 'eslint/config';

export default [
  ...nest(), // typeChecked defaults to true for Nest
  globalIgnores(['dist/**']),
];
```

### React + Vite

```js
import { react } from '@zoldytech/eslint-config/eslint';
export default react();
```

### Plain JS/TS

```js
import { base } from '@zoldytech/eslint-config/eslint';
export default base();
```

Subpath imports also work directly: `@zoldytech/eslint-config/eslint/next`, `/eslint/base`, etc.

### Options

Every preset accepts the same options (all optional):

| Option            | Default                     | Purpose                                                                                          |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| `typeChecked`     | `false` (`true` for `nest`) | Enable type-aware linting (activates the ~68 type-checking sonarjs rules). Needs `tsconfigPath`. |
| `tsconfigPath`    | `./tsconfig.eslint.json`    | tsconfig used for typed linting.                                                                 |
| `tsconfigRootDir` | `process.cwd()`             | Root for resolving `tsconfigPath`. Pass `import.meta.dirname` for precision.                     |
| `tsdoc`           | `false`                     | Enable the `tsdoc/syntax` gate on TS files.                                                      |
| `reactVersion`    | _unset_ (auto-detect)       | Pin the React version (`react`/`next` only). Leave unset on ESLint 9. Required on ESLint 10.     |
| `testGlobs`       | test/spec/config globs      | Override where a subset of sonarjs rules is relaxed.                                             |
| `ignores`         | `[]`                        | Project ignore globs (flat-config `ignores`).                                                    |
| `overrides`       | `[]`                        | Extra flat-config blocks, spread last so they win.                                               |

Type-aware linting needs a tsconfig that includes the files being linted (usually a
`tsconfig.eslint.json` with a broader `include` than your build tsconfig, covering tests/e2e).
With `typeChecked`, a `.ts` file _not_ covered by that tsconfig aborts the whole run with a
`parserOptions.project` error — this is inherent to typescript-eslint's explicit-project mode, so
make sure the tsconfig's `include`/`exclude` matches what ESLint lints.

`tsdoc` is **opt-in** (`tsdoc: true`). Projects that previously enforced `tsdoc/syntax` on every
file must pass it explicitly to keep that gate.

## Prettier

Point Prettier at the shared config in your `package.json`:

```json
{ "prettier": "@zoldytech/eslint-config/prettier" }
```

ESLint owns code quality; Prettier owns formatting. The presets include `eslint-config-prettier`,
so the two never fight.

## TypeScript

Extend the matching base in your `tsconfig.json`:

```json
{
  "extends": "@zoldytech/eslint-config/tsconfig/next.json",
  "compilerOptions": { "paths": { "@/*": ["./src/*"] } },
  "include": ["src", "next-env.d.ts"]
}
```

Available: `tsconfig/base.json`, `/react.json`, `/next.json`, `/nest.json` (the framework ones
extend `base`).

## Git hooks (recommended, not shipped)

This package ships no hooks. The pipeline both reference projects use — wire it in your own repo:

```jsonc
// package.json
{
  "scripts": { "prepare": "husky" },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{css,json,md,yml,yaml}": ["prettier --write"],
  },
}
```

```sh
# .husky/pre-commit
npx lint-staged
```

To baseline an existing project's violations without failing on them, use ESLint's native bulk
suppressions: `eslint --suppress-all` writes `eslint-suppressions.json`, and CI runs
`eslint . --pass-on-unpruned-suppressions` so only _new_ violations fail.

## ESLint 10

This line targets **ESLint 9**. The rule logic itself runs on ESLint 10 in local testing, but two
ecosystem gaps keep the published line on 9 for now: `eslint-plugin-react` and `eslint-config-next`
don't yet declare an ESLint 10 peer (installing on 10 requires `legacy-peer-deps`), and
`eslint-plugin-unicorn@71` — the ESLint-10 line — can't co-exist with the ESLint-9 line. A `v0.2.0`
targeting ESLint 10 follows once those peers are updated.

**When you do run on ESLint 10**, the `react`/`next` presets **require** `reactVersion` to be set
(e.g. `next({ reactVersion: '19.0' })`) — eslint-plugin-react's version auto-detection calls a
`context` API removed in ESLint 10 and will otherwise crash the run.

## Development

```bash
npm install     # clean install, no flags needed on ESLint 9
npm run lint    # dogfoods the base preset on this repo
npm test        # E2E: each preset lints its fixture app (node --test)
```

## License

MIT
