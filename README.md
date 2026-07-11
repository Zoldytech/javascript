# @zoldytech/eslint-config

A general-purpose ESLint **house style**, built on [`@antfu/eslint-config`](https://github.com/antfu/eslint-config)
and made **SonarQube-compatible**: local ESLint mirrors what the SonarQube gate flags, so you fix
Sonar issues before they reach CI. Four stack presets — **plain JS/TS**, **React + Vite**,
**Next.js**, **NestJS**.

- **antfu foundation** — TypeScript, imports, `unicorn`, node, `jsonc`/`yaml`/`markdown`, sensible
  modern defaults, one `--fix`.
- **SonarQube layer on top** — the full `eslint-plugin-sonarjs` recommended set, cognitive complexity
  capped at 15, plus `unicorn`/core rules mapped to the SonarQube S-codes sonarjs doesn't ship
  (S7781, S7763, S6606, S7735, …). Appended after antfu so it wins on conflicts.
- **Prettier owns formatting** (`stylistic: false` + `eslint-config-prettier`). Formatting is a
  separable layer — swapping to another formatter later doesn't touch the rules.
- Also ships a shared Prettier config and TypeScript base configs.

## Requirements

- **ESLint 10.4+** (peer `eslint >=10.4`). The antfu foundation bundles `eslint-plugin-unicorn@68`,
  which requires ESLint ≥ 10.4 — so this is a hard floor for a clean install (including pnpm/yarn and
  npm `--strict-peer-deps`).
- **Node** `^22.13 || >=24` (antfu's plugins require Node ≥ 22).
- **TypeScript** ≥ 5 (peer).
- **Prettier** — you install it; it owns formatting (this package ships the shared config, not Prettier
  itself). See [Prettier](#prettier).

## Install

Distributed via GitHub URL, pinned to a tag (no build step runs on install — raw ESM):

```bash
npm i -D "github:zoldytech/eslint-config#v0.1.0"
```

## Usage

Each preset is a function that returns an antfu `FlatConfigComposer`. Use it as the **default
export** of your `eslint.config.mjs` (no array spread needed) — pass project ignores and extra
config blocks as options:

```js
// eslint.config.mjs — Next.js
import { next } from '@zoldytech/eslint-config/eslint';

export default next({
  typeChecked: true,
  ignores: ['.next/**', 'coverage/**'],
});
```

```js
// NestJS (typeChecked defaults to true)
import { nest } from '@zoldytech/eslint-config/eslint';
export default nest({ tsconfigPath: 'tsconfig.json' });
```

```js
// React + Vite
import { react } from '@zoldytech/eslint-config/eslint';
export default react();
```

```js
// plain JS/TS
import { base } from '@zoldytech/eslint-config/eslint';
export default base();
```

Subpaths also work directly: `@zoldytech/eslint-config/eslint/next`, `/eslint/base`, etc.

### Options

Every preset accepts the same options (all optional):

| Option         | Default                     | Purpose                                                                                                |
| -------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `typeChecked`  | `false` (`true` for `nest`) | Enable antfu type-aware linting (activates the ~68 type-checking sonarjs rules). Needs `tsconfigPath`. |
| `tsconfigPath` | `'tsconfig.json'`           | tsconfig for type-aware linting (resolved from where you run ESLint).                                  |
| `tsdoc`        | `false`                     | Enable the `tsdoc/syntax` gate on TS files.                                                            |
| `ignores`      | `[]`                        | Project ignore globs (forwarded to antfu).                                                             |
| `testGlobs`    | test/spec/config globs      | Override where a subset of sonarjs rules is relaxed.                                                   |
| `overrides`    | `[]`                        | Extra flat-config blocks, appended last so they win.                                                   |
| `antfuOptions` | `{}`                        | Extra options merged straight into the underlying `antfu()` call.                                      |

Type-aware linting needs a tsconfig that includes the files being linted. A `.ts` file outside that
tsconfig aborts the run with a `projectService` error — this is inherent to type-aware linting, so
keep the tsconfig's `include`/`exclude` in sync with what ESLint lints.

## Prettier

Point Prettier at the shared config in `package.json`:

```json
{ "prettier": "@zoldytech/eslint-config/prettier" }
```

ESLint owns code quality; Prettier owns formatting. The presets set antfu `stylistic: false` and
include `eslint-config-prettier`, so the two never fight.

## TypeScript

Extend the matching base in `tsconfig.json`:

```json
{
  "extends": "@zoldytech/eslint-config/tsconfig/next.json",
  "compilerOptions": { "paths": { "@/*": ["./src/*"] } },
  "include": ["src"]
}
```

Available: `tsconfig/base.json`, `/react.json`, `/next.json`, `/nest.json` (framework ones extend base).

## Git hooks (recommended, not shipped)

This package ships no hooks. Wire the recommended pipeline in your own repo:

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

To adopt this style in an existing project without failing on pre-existing issues, baseline them
with ESLint's native bulk suppressions: `eslint --suppress-all` writes `eslint-suppressions.json`,
and CI runs `eslint . --pass-on-unpruned-suppressions` so only _new_ violations fail.

## Notes

- **Rule namespaces** follow antfu's short names: `ts/*` (typescript-eslint), `react/*`
  (`@eslint-react`, which also provides `react/exhaustive-deps` / `react/rules-of-hooks`),
  `import/*`, `unicorn/*`, `next/*` (`@next/eslint-plugin-next`). The `next` preset uses
  `@next/eslint-plugin-next` directly (no `eslint-config-next`, no `next` package needed).
- **`no-console`** bans all `console.*` (SonarQube S106), overriding antfu's `warn`/`error` allowance.
- **First `eslint --fix` reorders imports** — antfu's `perfectionist` rules sort imports and named
  members. Expect a one-time formatting diff when a project first adopts the style.

## Development

```bash
npm install     # clean install, no flags
npm run lint    # dogfoods the base preset on this repo
npm test        # E2E: each preset lints its fixture app (node --test)
```

CI runs the suite on ESLint 10 across Node 22/24.

## License

MIT
