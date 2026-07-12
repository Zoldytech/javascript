# React Native support

## What ships today

The `reactNative` preset (`eslint/react-native.js`, exported as
`@zoldytech/javascript/eslint/react-native`) is the `react` preset's foundation
applied to React Native:

- **antfu `react: true`** — `@eslint-react` + `react-refresh` + `react-hooks`
  (`react/exhaustive-deps`, `react/rules-of-hooks`, Fast-Refresh checks). These
  are React-semantic, not DOM-specific, so they apply to RN unchanged.
- **The full SonarQube layer** (`sonarLayer` + `sonarReactRules` + `sonarTestOff`).
  React Native is just React + TS/JS; SonarQube itself ships **no** RN-specific
  rules, so this is full SonarQube parity for RN code.
- **RN runtime globals** (`__DEV__`, `HermesInternal`) so they don't trip
  `no-undef`. antfu already provides the browser + node globals RN relies on
  (`fetch`, `navigator`, `process`, `require`, timers, …).
- **`tsconfig/react-native.json`** — extends base, `jsx: react-jsx`, includes the
  DOM lib (see [react-native-web](#react-native-web) below).

Same option shape as every other preset (`typeChecked`, `tsconfigPath`, `tsdoc`,
`ignores`, `testGlobs`, `overrides`, `antfuOptions`).

## react-native-web

Universal codebases that also target the web via
[`react-native-web`](https://necolas.github.io/react-native-web/) are supported
with no extra ESLint config:

- **Linting is identical.** RNW runs in the browser, so antfu's `browser` globals
  already cover the web APIs, `__DEV__` is declared by the preset, and web-only
  files (`Foo.web.tsx`, `Foo.web.ts`) already match the preset's globs. The same
  React rules apply on both platforms. Nothing platform-specific to wire in.
- **TypeScript.** `tsconfig/react-native.json` deliberately keeps the **DOM lib**
  (`["ES2022", "DOM", "DOM.Iterable"]`) so web-targeted and web-only code
  type-checks — TypeScript can't vary `lib` per file, so the web target sets the
  floor. RNW ships augmented type definitions; install `@types/react-native-web`
  and, if you want the web-augmented surface, add
  `"types": ["react-native-web"]` in your project `tsconfig.json`.

  ```json
  {
    "extends": "@zoldytech/javascript/tsconfig/react-native.json",
    "compilerOptions": { "types": ["react-native-web"] },
    "include": ["src"]
  }
  ```

  **Native-only** projects (no web target) can drop the DOM lib to catch
  accidental DOM usage on native, by overriding `lib` in their own tsconfig:
  `"compilerOptions": { "lib": ["ES2022"] }`.
- The bundler alias (`react-native$` → `react-native-web`) is a build-tool concern
  (webpack/Metro/Vite), out of scope for this package.

## Deferred: RN-specific style rules (blocked on ESLint 10)

The RN-idiom lint rules — `no-inline-styles`, `no-color-literals`,
`no-unused-styles`, `split-platform-components`, `no-single-element-style-arrays`,
`no-raw-text`, `sort-styles` — live only in
[`eslint-plugin-react-native`](https://github.com/intellicode/eslint-plugin-react-native).
They are **not** wired in yet because that plugin is incompatible with ESLint 10,
which this package requires (peer `eslint >=10.4`).

**Verified against ESLint 10.7 (2026-07):**

| Rule | Status on ESLint 10 |
| --- | --- |
| `no-unused-styles`, `no-inline-styles`, `no-color-literals`, `sort-styles` | **crash** — call `context.getSourceCode()` (removed in ESLint 10) |
| `split-platform-components` | **crash** — calls `context.getFilename()` (removed in ESLint 10) |
| `no-raw-text`, `no-single-element-style-arrays` | load but are the least useful rules |

`eslint-plugin-react-native@5.0.0` is the latest release and declares peer
`eslint ^3 … ^9`. `@react-native/eslint-plugin` ships no style rules
(`platform-colors`, `no-deep-imports` only). `@react-native/eslint-config` peers
`eslint ^8 || ^9` and pulls in `eslint-plugin-react`, which this package
deliberately avoids (see `eslint/next.js` header).

Registering the raw rule objects ourselves does **not** work around this: the
rule bodies themselves call the removed APIs.

## Plan for adding the style rules

When `eslint-plugin-react-native` publishes an ESLint-10-compatible release (drops
`context.getSourceCode()`/`getFilename()`, widens its `eslint` peer range):

1. Add it as a dependency (`npm i -D eslint-plugin-react-native`) and confirm
   `npm install` resolves cleanly against `eslint >=10.4` (no `--legacy-peer-deps`).
2. In `eslint/react-native.js`, extend `reactNativeGlobals()` into a full
   `reactNativeLayer()` block that also registers the plugin and its rules
   (mirror `nextCoreWebVitals()` in `eslint/next.js`):

   ```js
   import reactNativePlugin from 'eslint-plugin-react-native';

   // Replace reactNativeGlobals() with a full layer block that also registers
   // the plugin (mirror nextCoreWebVitals()):
   const reactNativeLayer = {
     name: 'zoldytech/react-native',
     files: ['**/*.{js,jsx,ts,tsx}'],
     plugins: { 'react-native': reactNativePlugin },
     // the plugin exposes the RN env globals directly:
     languageOptions: {
       globals: { ...reactNativePlugin.environments['react-native'].globals },
     },
     rules: {
       'react-native/no-unused-styles': 'error',
       'react-native/no-single-element-style-arrays': 'error',
       'react-native/split-platform-components': 'error',
       'react-native/no-inline-styles': 'error',
       'react-native/no-color-literals': 'error',
       'react-native/no-raw-text': 'error', // noisiest — relax via `overrides` if needed
     },
   };
   ```

   (Omit `sort-styles` — pure ordering, Prettier's domain.)
3. Add a `dirty.tsx` case to `test/fixtures/react-native/` that trips a couple of
   the style rules and extend the `presetSuite('react-native', …)` expected-rules
   list in `test/presets.test.js` accordingly.
4. Verify with `npm test` and a manual lint of a snippet with an inline style, a
   color literal, and an unused `StyleSheet` entry.

Track upstream: <https://github.com/intellicode/eslint-plugin-react-native/issues>
(ESLint 10 / flat-config support).
