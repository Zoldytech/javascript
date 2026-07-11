// react — house style for React + Vite apps. antfu's react support (@eslint-react
// + react-refresh, which already enables exhaustive-deps / rules-of-hooks / etc.)
// plus the SonarQube-compatibility layer.

import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier/flat';
import { antfuTypescript, sonarLayer, sonarReactRules, sonarTestOff } from './_shared.js';

/**
 * @typedef {object} ReactOptions
 * @property {boolean} [typeChecked=false] Enable type-aware linting (needs `tsconfigPath`).
 * @property {string} [tsconfigPath='tsconfig.json'] tsconfig for type-aware linting.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, appended last.
 * @property {Record<string, unknown>} [antfuOptions] Extra options merged into antfu().
 */

/**
 * React + Vite house-style preset. Returns antfu's FlatConfigComposer (thenable).
 * @param {ReactOptions} [options]
 */
export function react(options = {}) {
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
    ...sonarLayer({ tsdoc }),
    sonarReactRules(),
    sonarTestOff(testGlobs),
    prettier,
    ...overrides
  );
}

export default react;
