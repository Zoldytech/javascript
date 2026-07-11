// next — house style for Next.js apps. antfu react support + @next/eslint-plugin-next
// (core-web-vitals) + the SonarQube-compatibility layer. No eslint-config-next
// (which drags in the un-ESLint-10 eslint-plugin-react/import) and no `next`
// package dependency — @next/eslint-plugin-next ships only its own rules.

import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier/flat';
import { antfuTypescript, sonarLayer, sonarReactRules, sonarTestOff } from './_shared.js';

/**
 * Flat-config block registering @next/eslint-plugin-next with its core-web-vitals
 * ruleset (recommended + the CWV-critical rules bumped to error).
 */
function nextCoreWebVitals() {
  const cwv = nextPlugin.configs['core-web-vitals'];
  return {
    name: 'zoldytech/next-core-web-vitals',
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, ...cwv.rules },
  };
}

/**
 * @typedef {object} NextOptions
 * @property {boolean} [typeChecked=false] Enable type-aware linting (needs `tsconfigPath`).
 * @property {string} [tsconfigPath='tsconfig.json'] tsconfig for type-aware linting.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, appended last.
 * @property {Record<string, unknown>} [antfuOptions] Extra options merged into antfu().
 */

/**
 * Next.js house-style preset. Returns antfu's FlatConfigComposer (thenable).
 * @param {NextOptions} [options]
 */
export function next(options = {}) {
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
    nextCoreWebVitals(),
    ...sonarLayer({ tsdoc }),
    sonarReactRules(),
    sonarTestOff(testGlobs),
    prettier,
    ...overrides
  );
}

export default next;
