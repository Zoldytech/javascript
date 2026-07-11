// SonarQube-compatibility layer, appended AFTER @antfu/eslint-config so it wins
// on conflicts. This is the package's reason to exist: local ESLint mirrors what
// the SonarQube gate flags, via eslint-plugin-sonarjs (SonarSource's own plugin)
// plus the unicorn/core rules mapped to the SonarQube S-codes sonarjs doesn't ship.
//
// antfu already registers `ts`, `import`, `unicorn`, `unused-imports`, `node`, etc.
// and owns unused-imports/parser setup — so this layer references those plugins by
// antfu's short names (e.g. `ts/`, `import/`) and does NOT re-declare them.

import sonarjs from 'eslint-plugin-sonarjs';
import tsdocPlugin from 'eslint-plugin-tsdoc';

/** JS/TS globs the Sonar rules apply to (not json/yaml/md, which antfu lints separately). */
export const CODE_GLOBS = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];
/** TypeScript file globs (tsdoc gate). */
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
 * The SonarQube-compatibility overlay: full eslint-plugin-sonarjs recommended set
 * (type-aware rules activate only when the preset enables typeChecked), cognitive
 * complexity capped at 15, the unicorn/core→S-code mappings, and a few hard
 * guardrails. Appended after antfu so these win.
 * @param {{ tsdoc?: boolean }} [opts]
 * @returns {import('eslint').Linter.Config[]} the Sonar overlay blocks (main gate + optional tsdoc).
 */
export function sonarLayer(opts = {}) {
  const { tsdoc = false } = opts;
  return [
    {
      name: 'zoldytech/sonar',
      files: CODE_GLOBS,
      plugins: { sonarjs },
      rules: {
        // Full eslint-plugin-sonarjs recommended set — the SonarQube mirror.
        ...sonarjs.configs.recommended.rules,
        'sonarjs/cognitive-complexity': ['error', 15], // S3776
        // Disabled with rationale:
        'sonarjs/no-unused-vars': 'off', // antfu's unused-imports owns this (^_-aware)
        'sonarjs/void-use': 'off', // conflicts with `void promise` fire-and-forget convention
        'sonarjs/prefer-read-only-props': 'off', // Readonly<> on React props is noise in modern React
        'sonarjs/deprecation': 'off', // dependency-rename churn; tracked via upgrades
        // unicorn / core rules wrapping SonarQube TS S-codes not in the sonarjs set
        // (unicorn is registered by antfu):
        'unicorn/prefer-string-replace-all': 'error', // S7781
        'unicorn/prefer-export-from': 'error', // S7763
        'unicorn/prefer-global-this': 'error', // S7764
        'logical-assignment-operators': ['error', 'always'], // S6606
        'unicorn/no-negated-condition': 'error', // S7735
        'unicorn/no-typeof-undefined': 'error', // S7741
        'no-useless-escape': 'error', // S6535
        'unicorn/no-zero-fractions': 'error', // S7748
        'unicorn/new-for-builtins': 'error', // S7723
        'import/no-duplicates': 'error', // S3863 (antfu registers `import`)
        // Hard guardrails (antfu names: `ts/` = typescript-eslint).
        // no-console uses explicit options: a bare severity would RETAIN antfu's
        // `allow: ['warn','error']`; SonarQube S106 flags all console.* so we ban all.
        'no-console': ['error', {}],
        'no-debugger': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        // Explicit {} so antfu's permissive options (allowShortCircuit/Ternary)
        // don't survive via flat-config's severity-only option retention.
        'ts/no-unused-expressions': ['error', {}],
      },
    },
    ...(tsdoc
      ? [
          {
            name: 'zoldytech/sonar-tsdoc',
            files: TS_GLOBS,
            plugins: { tsdoc: tsdocPlugin },
            rules: { 'tsdoc/syntax': 'error' },
          },
        ]
      : []),
  ];
}

/**
 * React-only SonarQube S-code additions (antfu's `react` = @eslint-react already
 * enables exhaustive-deps / rules-of-hooks / etc). Only for presets that register
 * the react plugin (react, next). S6772 jsx-child-element-spacing has no
 * @eslint-react equivalent, so it is intentionally omitted.
 * @returns {import('eslint').Linter.Config} the react-only S-code block.
 */
export function sonarReactRules() {
  return {
    name: 'zoldytech/sonar-react',
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/jsx-no-useless-fragment': 'error', // S6749
    },
  };
}

/**
 * sonarjs rules that are noise in tests/fixtures/config files.
 * @param {string[]} [testGlobs]
 * @returns {import('eslint').Linter.Config} the tests/config sonarjs-off block.
 */
export function sonarTestOff(testGlobs = DEFAULT_TEST_GLOBS) {
  return {
    name: 'zoldytech/sonar-test-off',
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

/**
 * Maps our `{ typeChecked, tsconfigPath }` options to antfu's `typescript` option.
 * antfu enables type-aware linting (projectService) only when given a tsconfigPath,
 * which is exactly what activates the ~68 type-aware sonarjs rules.
 * @param {{ typeChecked?: boolean, tsconfigPath?: string }} opts
 */
export function antfuTypescript({ typeChecked = false, tsconfigPath = 'tsconfig.json' } = {}) {
  return typeChecked ? { tsconfigPath } : true;
}
