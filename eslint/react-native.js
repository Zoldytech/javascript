// react-native — house style for React Native apps. Same foundation as the
// `react` preset (antfu's react support = @eslint-react + react-refresh, which
// already enables exhaustive-deps / rules-of-hooks / Fast-Refresh checks) plus
// the SonarQube-compatibility layer. React Native ships no SonarQube-specific
// rules — it is just React + TS/JS — so the `react` guardrails apply verbatim;
// this preset adds the RN runtime globals (`__DEV__`, `HermesInternal`) so they
// don't trip `no-undef`, and a matching `tsconfig/react-native.json` (which keeps
// the DOM lib so react-native-web's web target type-checks — see docs).
//
// NOTE: the RN-specific style rules (no-inline-styles, no-color-literals,
// no-unused-styles, split-platform-components, …) are intentionally NOT wired in
// yet: their only source, eslint-plugin-react-native, crashes on ESLint 10 (it
// calls the removed context.getSourceCode/getFilename APIs). They will be added
// once that plugin supports ESLint 10 — see docs/react-native.md.

import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier/flat';
import {
  antfuTypescript,
  declarationFileOverrides,
  sonarLayer,
  sonarReactRules,
  sonarTestOff,
} from './_shared.js';

/**
 * RN runtime globals that antfu's browser+node globals don't already cover.
 * Declaring them stops `no-undef` firing on `__DEV__` etc. in `.js` files (in TS
 * files typescript-eslint disables `no-undef` and the type checker handles it).
 */
function reactNativeGlobals() {
  return {
    name: 'zoldytech/react-native-globals',
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        HermesInternal: 'readonly',
      },
    },
  };
}

/**
 * @typedef {object} ReactNativeOptions
 * @property {boolean} [typeChecked=false] Enable type-aware linting (needs `tsconfigPath`).
 * @property {string} [tsconfigPath='tsconfig.json'] tsconfig for type-aware linting.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, appended last.
 * @property {Record<string, unknown>} [antfuOptions] Extra options merged into antfu().
 */

/**
 * React Native house-style preset. Returns antfu's FlatConfigComposer (thenable).
 * @param {ReactNativeOptions} [options]
 */
export function reactNative(options = {}) {
  const {
    typeChecked = false,
    tsconfigPath,
    tsdoc = false,
    ignores = [],
    testGlobs,
    overrides = [],
    antfuOptions = {},
  } = options;

  return antfu(
    {
      type: 'app',
      react: true,
      typescript: antfuTypescript({ typeChecked, tsconfigPath }),
      stylistic: false,
      ignores,
      ...antfuOptions,
    },
    reactNativeGlobals(),
    ...sonarLayer({ tsdoc }),
    sonarReactRules(),
    sonarTestOff(testGlobs),
    prettier,
    declarationFileOverrides(),
    ...overrides
  );
}

export default reactNative;
