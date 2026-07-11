// base — framework-agnostic SonarQube-equivalent guardrail for plain JS/TS.
// The React/Next/Nest presets compose this core and layer their framework
// rules on top.

import prettier from 'eslint-config-prettier/flat';
import { tsLanguageBlock, guardrailGate, sonarjsTestOff, tsdocBlock } from './_shared.js';

/**
 * @typedef {object} BaseOptions
 * @property {boolean} [typeChecked=false] Enable type-aware linting (activates the
 *   ~68 sonarjs rules that require the TypeScript type checker). Needs `tsconfigPath`.
 * @property {string} [tsconfigPath='./tsconfig.eslint.json'] tsconfig used for typed linting.
 * @property {string} [tsconfigRootDir=process.cwd()] Root for resolving `tsconfigPath`.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate on TS files.
 * @property {string[]} [testGlobs] Override the tests/fixtures/config globs where a
 *   subset of sonarjs rules is disabled.
 * @property {string[]} [ignores=[]] Project-specific ignore globs (flat-config `ignores`).
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra flat-config blocks,
 *   spread last so they win.
 */

/**
 * Framework-agnostic guardrail preset.
 * @param {BaseOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function base(options = {}) {
  const {
    typeChecked = false,
    tsconfigPath,
    tsconfigRootDir,
    tsdoc = false,
    testGlobs,
    ignores = [],
    overrides = [],
  } = options;

  return [
    tsLanguageBlock({ typeChecked, tsconfigPath, tsconfigRootDir }),
    prettier,
    guardrailGate(),
    ...(tsdoc ? [tsdocBlock()] : []),
    sonarjsTestOff(testGlobs),
    ...(ignores.length > 0 ? [{ ignores }] : []),
    ...overrides,
  ];
}

export default base;
