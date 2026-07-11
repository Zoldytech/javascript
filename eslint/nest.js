// nest — the guardrail for NestJS apps. Framework-agnostic gate + type-aware
// rules that fit Nest's class/decorator/DI idiom. Type-aware by default (Nest
// leans on it heavily), so `tsconfigPath` must point at a tsconfig covering src.

import prettier from 'eslint-config-prettier/flat';
import {
  TS_GLOBS,
  tsLanguageBlock,
  guardrailGate,
  sonarjsTestOff,
  tsdocBlock,
  DEFAULT_TEST_GLOBS,
} from './_shared.js';

/**
 * @typedef {object} NestOptions
 * @property {boolean} [typeChecked=true] Type-aware linting (default on for Nest).
 * @property {string} [tsconfigPath='./tsconfig.eslint.json'] tsconfig for typed linting.
 * @property {string} [tsconfigRootDir=process.cwd()] Root for resolving `tsconfigPath`.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, spread last.
 */

/**
 * NestJS guardrail preset.
 * @param {NestOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function nest(options = {}) {
  const {
    typeChecked = true,
    tsconfigPath,
    tsconfigRootDir,
    tsdoc = false,
    testGlobs = DEFAULT_TEST_GLOBS,
    ignores = [],
    overrides = [],
  } = options;

  return [
    tsLanguageBlock({ typeChecked, tsconfigPath, tsconfigRootDir }),
    guardrailGate(),
    // Type-aware rules require type info — only enable them when typeChecked,
    // otherwise `@typescript-eslint/no-floating-promises` etc. crash the run.
    ...(typeChecked
      ? [
          {
            files: TS_GLOBS,
            rules: {
              '@typescript-eslint/no-floating-promises': 'error',
              '@typescript-eslint/require-await': 'error',
              '@typescript-eslint/explicit-function-return-type': [
                'warn',
                { allowExpressions: true, allowTypedFunctionExpressions: true },
              ],
            },
          },
          {
            // Nest test/spec files: relax return-type + floating-promise noise.
            files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts'],
            rules: {
              '@typescript-eslint/explicit-function-return-type': 'off',
              '@typescript-eslint/no-floating-promises': 'off',
            },
          },
        ]
      : []),
    prettier,
    sonarjsTestOff(testGlobs),
    ...(tsdoc ? [tsdocBlock()] : []),
    ...(ignores.length > 0 ? [{ ignores }] : []),
    ...overrides,
  ];
}

export default nest;
