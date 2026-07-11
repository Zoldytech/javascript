// E2E: each preset lints its fixture app through the real ESLint engine.
// Clean file must produce zero errors; dirty file must trip the expected rules.
// Fidelity: each fixture has its own eslint.config.mjs importing the preset the
// way a consumer would, and we lint with cwd set to that fixture directory.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = (name) => path.join(here, 'fixtures', name);

/** Lint one fixture file with the fixture's own config; return the result. */
async function lintFixture(name, file) {
  const cwd = fixtureDir(name);
  const eslint = new ESLint({ cwd });
  const [result] = await eslint.lintFiles([path.join(cwd, file)]);
  return result;
}

const ruleIds = (result) => new Set(result.messages.map((m) => m.ruleId));
const detail = (result) =>
  result.messages.map((m) => `${m.ruleId ?? 'fatal'}: ${m.message}`).join('\n');

/**
 * @param {string} preset
 * @param {string} cleanFile
 * @param {string} dirtyFile
 * @param {string[]} expectedRules
 */
function presetSuite(preset, cleanFile, dirtyFile, expectedRules) {
  test(`${preset}: clean file has zero errors`, async () => {
    const result = await lintFixture(preset, cleanFile);
    assert.equal(result.errorCount, 0, `expected clean, got:\n${detail(result)}`);
  });

  test(`${preset}: dirty file trips ${expectedRules.join(', ')}`, async () => {
    const result = await lintFixture(preset, dirtyFile);
    const ids = ruleIds(result);
    for (const rule of expectedRules) {
      assert.ok(ids.has(rule), `expected ${rule} to fire. got:\n${detail(result)}`);
    }
  });
}

presetSuite('plain', 'clean.ts', 'dirty.ts', [
  'no-console',
  'unused-imports/no-unused-imports',
  'import-x/no-duplicates',
  'sonarjs/cognitive-complexity', // the headline SonarQube guardrail
]);

presetSuite('react-vite', 'clean.tsx', 'dirty.tsx', ['no-console', 'react-hooks/exhaustive-deps']);

presetSuite('next', 'clean.tsx', 'dirty.tsx', [
  'no-console',
  'react-hooks/exhaustive-deps',
  '@next/next/no-img-element', // the Next-specific layer
]);

presetSuite('nest', 'clean.ts', 'dirty.ts', [
  'no-console',
  '@typescript-eslint/no-floating-promises',
]);
