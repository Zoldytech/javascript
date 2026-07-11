// nest — house style for NestJS apps. antfu type-aware TypeScript + Nest-fit rules
// (floating promises, require-await, explicit return types) + the SonarQube layer.
// Type-aware by default (Nest leans on it), so `tsconfigPath` must cover src.

import antfu from '@antfu/eslint-config';
import prettier from 'eslint-config-prettier/flat';
import { antfuTypescript, sonarLayer, sonarTestOff, TS_GLOBS } from './_shared.js';

/**
 * @typedef {object} NestOptions
 * @property {boolean} [typeChecked=true] Type-aware linting (default on for Nest).
 * @property {string} [tsconfigPath='tsconfig.json'] tsconfig for type-aware linting.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, appended last.
 * @property {Record<string, unknown>} [antfuOptions] Extra options merged into antfu().
 */

/**
 * NestJS house-style preset. Returns antfu's FlatConfigComposer (thenable).
 * @param {NestOptions} [options]
 */
export function nest(options = {}) {
  const {
    typeChecked = true,
    tsconfigPath,
    tsdoc = false,
    ignores = [],
    testGlobs,
    overrides = [],
    antfuOptions = {},
  } = options;

  const nestRules = typeChecked
    ? [
        {
          name: 'zoldytech/nest',
          files: TS_GLOBS,
          rules: {
            'ts/no-floating-promises': 'error',
            'ts/require-await': 'error',
            'ts/explicit-function-return-type': [
              'warn',
              { allowExpressions: true, allowTypedFunctionExpressions: true },
            ],
          },
        },
        {
          name: 'zoldytech/nest-tests',
          files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
          rules: {
            'ts/explicit-function-return-type': 'off',
            'ts/no-floating-promises': 'off',
          },
        },
      ]
    : [];

  return antfu(
    {
      type: 'app',
      typescript: antfuTypescript({ typeChecked, tsconfigPath }),
      stylistic: false,
      ignores,
      ...antfuOptions,
    },
    ...sonarLayer({ tsdoc }),
    ...nestRules,
    sonarTestOff(testGlobs),
    prettier,
    ...overrides
  );
}

export default nest;
