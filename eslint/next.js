// next — the guardrail for Next.js apps. Layers eslint-config-next
// (core-web-vitals + typescript, which register react/react-hooks/import/@next)
// under the framework-agnostic guardrail gate. Reproduces the structure the
// fluxo-web / standex-capexlog configs converged on.

import { createRequire } from 'node:module';
import prettier from 'eslint-config-prettier/flat';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import {
  guardrailGate,
  reactRules,
  reactVersionBlock,
  typedProjectBlock,
  sonarjsTestOff,
  tsdocBlock,
  allReactHooksOff,
  DEFAULT_TEST_GLOBS,
} from './_shared.js';

// eslint-config-next is loaded lazily (inside next()) via createRequire so that
// importing the package barrel does NOT pull in eslint-config-next — and thus
// its `next` package parser requirement — for base/react/nest-only consumers
// that don't have `next` installed.
const require = createRequire(import.meta.url);

/**
 * @typedef {object} NextOptions
 * @property {boolean} [typeChecked=false] Add `parserOptions.project` (parser comes from
 *   eslint-config-next/typescript) so the type-aware sonarjs rules activate.
 * @property {string} [tsconfigPath='./tsconfig.eslint.json'] tsconfig for typed linting.
 * @property {string} [tsconfigRootDir=process.cwd()] Root for resolving `tsconfigPath`.
 * @property {boolean} [tsdoc=false] Enable the `tsdoc/syntax` gate.
 * @property {string} [reactVersion] React version pinned into settings. Leave unset on ESLint 9
 *   (eslint-plugin-react auto-detects). REQUIRED on ESLint 10, where the `'detect'` path calls
 *   the removed `context.getFilename()` and crashes — set e.g. `'19.0'`.
 * @property {string[]} [testGlobs] Override the tests/config globs for the sonarjs-off block.
 * @property {string[]} [ignores=[]] Project-specific ignore globs.
 * @property {import('eslint').Linter.Config[]} [overrides=[]] Extra blocks, spread last.
 */

/**
 * Next.js guardrail preset.
 * @param {NextOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export function next(options = {}) {
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

  const nextVitals = require('eslint-config-next/core-web-vitals');
  const nextTs = require('eslint-config-next/typescript');

  return [
    ...nextVitals,
    ...nextTs,
    ...(typeChecked ? [typedProjectBlock({ tsconfigPath, tsconfigRootDir })] : []),
    prettier,
    guardrailGate(),
    reactRules(),
    ...(reactVersion ? [reactVersionBlock(reactVersion)] : []),
    ...(tsdoc ? [tsdocBlock()] : []),
    sonarjsTestOff(testGlobs),
    {
      // Test files: use*-named helpers false-positive rules-of-hooks; console + tsdoc noise.
      files: ['tests/**/*.{ts,tsx}', 'e2e/**/*.{ts,tsx}'],
      rules: {
        ...allReactHooksOff(reactHooksPlugin),
        '@next/next/no-html-link-for-pages': 'off',
        '@next/next/no-img-element': 'off',
        'no-console': 'off',
        ...(tsdoc ? { 'tsdoc/syntax': 'off' } : {}),
      },
    },
    ...(ignores.length > 0 ? [{ ignores }] : []),
    ...overrides,
  ];
}

export default next;
