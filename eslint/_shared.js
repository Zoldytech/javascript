// Internal building blocks shared across the base/react/next/nest presets.
// Not part of the public subpath exports — imported only by the preset files.
//
// The SonarQube-equivalent guardrail is split into a framework-agnostic core
// (`guardrailGate`) and a React layer (`reactRules`) so the framework-free
// `base` preset never references react/*, import/*, or @typescript-eslint/*
// rules whose plugins it does not register.

import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import importX from 'eslint-plugin-import-x';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

/** File globs eslint-config-next registers its react/import plugins for. */
export const ALL_GLOBS = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];
/** TypeScript file globs (where the TS parser + typed linting apply). */
export const TS_GLOBS = ['**/*.{ts,tsx,mts,cts}'];
/** Tests/fixtures/config where a subset of sonarjs rules are noise. */
export const DEFAULT_TEST_GLOBS = [
  '**/*.test.{ts,tsx}',
  '**/*.spec.{ts,tsx}',
  'tests/**',
  'e2e/**',
  '**/_test/**',
  '**/*.config.{ts,mts,mjs,js,cjs}',
];

/**
 * TS language setup: registers the typescript-eslint parser (+ plugin) and,
 * when `typeChecked`, wires the project service for type-aware sonarjs rules.
 * Framework presets that already bring a parser (next) skip this.
 * @param {{ typeChecked?: boolean, tsconfigPath?: string, tsconfigRootDir?: string }} [opts]
 */
export function tsLanguageBlock(opts = {}) {
  const {
    typeChecked = false,
    tsconfigPath = './tsconfig.eslint.json',
    tsconfigRootDir = process.cwd(),
  } = opts;
  return {
    files: TS_GLOBS,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: typeChecked ? { project: [tsconfigPath], tsconfigRootDir } : {},
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
  };
}

/**
 * Type-aware project block without a parser — for presets whose parser is
 * supplied by a framework config (e.g. eslint-config-next/typescript). Adds
 * only `parserOptions.project` so the type-aware sonarjs rules activate.
 * @param {{ tsconfigPath?: string, tsconfigRootDir?: string }} [opts]
 */
export function typedProjectBlock(opts = {}) {
  const { tsconfigPath = './tsconfig.eslint.json', tsconfigRootDir = process.cwd() } = opts;
  return {
    files: TS_GLOBS,
    languageOptions: { parserOptions: { project: [tsconfigPath], tsconfigRootDir } },
  };
}

/**
 * The framework-agnostic SonarQube guardrail gate. Full eslint-plugin-sonarjs
 * recommended set + curated unicorn/core rules mapped to S-codes sonarjs does
 * not ship + the unused-imports de-dup. No react/* here (see `reactRules`).
 */
export function guardrailGate() {
  return {
    files: ALL_GLOBS,
    plugins: {
      sonarjs,
      unicorn,
      'unused-imports': unusedImports,
      'import-x': importX,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Unused imports/vars via unused-imports (auto-fixable, ^_-aware); the
      // @typescript-eslint copy stays off to avoid double-reporting.
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'import-x/no-duplicates': 'error', // S3863
      // unicorn / core rules wrapping SonarQube TS S-codes not in the sonarjs set:
      'unicorn/prefer-string-replace-all': 'error', // S7781
      'unicorn/prefer-export-from': 'error', // S7763
      'unicorn/prefer-global-this': 'error', // S7764
      'logical-assignment-operators': ['error', 'always'], // S6606
      'unicorn/no-negated-condition': 'error', // S7735
      'unicorn/no-typeof-undefined': 'error', // S7741
      'no-useless-escape': 'error', // S6535
      'unicorn/no-zero-fractions': 'error', // S7748
      'unicorn/new-for-builtins': 'error', // S7723
      // Full eslint-plugin-sonarjs recommended set (type-aware rules no-op
      // without `typeChecked`; SonarQube CI is the enforcer for those).
      ...sonarjs.configs.recommended.rules,
      'sonarjs/cognitive-complexity': ['error', 15], // S3776
      // Disabled with rationale:
      'sonarjs/no-unused-vars': 'off', // duplicates unused-imports/no-unused-vars (^_-aware)
      'sonarjs/void-use': 'off', // conflicts with `void promise` fire-and-forget convention
      'sonarjs/prefer-read-only-props': 'off', // Readonly<> on React props is noise in modern React
      'sonarjs/deprecation': 'off', // dependency-rename churn; tracked via upgrades
    },
  };
}

/**
 * React-layer rules (require a react plugin registered by the caller — either
 * eslint-plugin-react directly or via eslint-config-next).
 */
export function reactRules() {
  return {
    files: ALL_GLOBS,
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/incompatible-library': 'error',
      'react-hooks/unsupported-syntax': 'error',
      'react/jsx-child-element-spacing': 'error', // S6772
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }], // S6749
    },
  };
}

/**
 * Overrides eslint-plugin-react's default `react.version: 'detect'`, whose
 * version-detection code calls the removed `context.getFilename()` and crashes
 * on ESLint 10. An explicit version skips detection. Applies to react + next.
 * @param {string} version
 */
export function reactVersionBlock(version) {
  return { settings: { react: { version } } };
}

/** sonarjs rules that are noise in tests/fixtures/config. */
export function sonarjsTestOff(testGlobs = DEFAULT_TEST_GLOBS) {
  return {
    files: testGlobs,
    rules: {
      'sonarjs/prefer-specific-assertions': 'off',
      'sonarjs/no-floating-point-equality': 'off',
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/hardcoded-secret-signatures': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/no-os-command-from-path': 'off',
      'sonarjs/no-skipped-tests': 'off',
      'sonarjs/assertions-in-tests': 'off',
      'sonarjs/no-redundant-boolean': 'off',
      'sonarjs/constructor-for-side-effects': 'off',
      'sonarjs/no-unused-collection': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/super-linear-regex': 'off',
      'sonarjs/no-alphabetical-sort': 'off',
    },
  };
}

/** tsdoc/syntax gate (opt-in via the `tsdoc` preset option). */
export function tsdocBlock() {
  return {
    files: TS_GLOBS,
    plugins: { tsdoc: tsdocPlugin },
    rules: { 'tsdoc/syntax': 'error' },
  };
}

/**
 * Builds a `{ 'react-hooks/<rule>': 'off' }` map for every rule the installed
 * react-hooks plugin ships — used to silence hook rules in test files where
 * use*-named helpers false-positive.
 * @param {{ rules?: Record<string, unknown> }} reactHooksPlugin
 */
export function allReactHooksOff(reactHooksPlugin) {
  return Object.fromEntries(
    Object.keys(reactHooksPlugin.rules ?? {}).map((r) => [`react-hooks/${r}`, 'off'])
  );
}
