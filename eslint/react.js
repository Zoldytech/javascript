// react — the guardrail for React + Vite apps. Registers eslint-plugin-react
// (recommended + jsx-runtime for the automatic JSX transform), react-hooks, and
// react-refresh (Vite HMR) directly on top of the framework-agnostic gate.

import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier/flat';
import {
  ALL_GLOBS,
  tsLanguageBlock,
  guardrailGate,
  reactRules,
  reactVersionBlock,
  sonarjsTestOff,
  tsdocBlock,
  allReactHooksOff,
  DEFAULT_TEST_GLOBS,
} from './_shared.js';

/**
 * @typedef {object} ReactOptions
 * @property {boolean} [typeChecked=false] Enable type-aware linting (needs `tsconfigPath`).
 * @property {string} [tsconfigPath='./tsconfig.eslint.json'] tsconfig for typed linting.
 * @property {string} [tsconfigRootDir=process.cwd()] Root for resolving `tsconfigPath`.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string} [reactVersion] React version pinned into settings. Unset on ESLint 9
 *   (auto-detected); required on ESLint 10 (see next.js).
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, spread last.
 */

/**
 * React + Vite guardrail preset.
 * @param {ReactOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function react(options = {}) {
  const {
    typeChecked = false,
    tsconfigPath,
    tsconfigRootDir,
    tsdoc = false,
    reactVersion,
    testGlobs = DEFAULT_TEST_GLOBS,
    ignores = [],
    overrides = [],
  } = options;

  return [
    tsLanguageBlock({ typeChecked, tsconfigPath, tsconfigRootDir }),
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'], // automatic JSX runtime: no react-in-jsx-scope
    prettier,
    guardrailGate(),
    reactRules(),
    {
      files: ALL_GLOBS,
      plugins: { 'react-hooks': reactHooksPlugin, 'react-refresh': reactRefresh },
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      },
    },
    ...(reactVersion ? [reactVersionBlock(reactVersion)] : []),
    ...(tsdoc ? [tsdocBlock()] : []),
    sonarjsTestOff(testGlobs),
    {
      files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: { ...allReactHooksOff(reactHooksPlugin), 'no-console': 'off' },
    },
    ...(ignores.length > 0 ? [{ ignores }] : []),
    ...overrides,
  ];
}

export default react;
