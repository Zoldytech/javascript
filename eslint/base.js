// base — general-purpose house style for plain JS/TS, built on @antfu/eslint-config
// with the SonarQube-compatibility layer on top. Prettier owns formatting
// (stylistic: false + eslint-config-prettier).

import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier/flat';
import { antfuTypescript, sonarLayer, sonarTestOff } from './_shared.js';

/**
 * @typedef {object} BaseOptions
 * @property {boolean} [typeChecked=false] Enable antfu's type-aware linting (activates the
 *   ~68 sonarjs rules that need the TypeScript type checker). Requires `tsconfigPath`.
 * @property {string} [tsconfigPath='tsconfig.json'] tsconfig used for type-aware linting.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate on TS files.
 * @property {'app'|'lib'} [type='app'] antfu project type.
 * @property {string[]} [ignores=[]] Project-specific ignore globs (forwarded to antfu).
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra flat-config blocks, appended last.
 * @property {Record<string, unknown>} [antfuOptions] Extra options merged into the antfu() call.
 */

/**
 * General-purpose guardrail preset. Returns antfu's FlatConfigComposer (thenable) —
 * use as `export default base({ ... })` (no spread needed).
 * @param {BaseOptions} [options]
 */
export function base(options = {}) {
  const {
    typeChecked = false,
    tsconfigPath,
    tsdoc = false,
    type = 'app',
    ignores = [],
    testGlobs,
    overrides = [],
    antfuOptions = {},
  } = options;

  return antfu(
    {
      type,
      typescript: antfuTypescript({ typeChecked, tsconfigPath }),
      stylistic: false, // Prettier owns formatting
      ignores,
      ...antfuOptions,
    },
    ...sonarLayer({ tsdoc }),
    sonarTestOff(testGlobs),
    prettier,
    ...overrides
  );
}

export default base;
