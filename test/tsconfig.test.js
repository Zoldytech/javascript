// The tsconfig presets are a published contract, so they get the same guard the ESLint presets do.
//
// `strict: true` alone does NOT enable `noUncheckedIndexedAccess` — it is opt-in, and it is the one
// flag that makes `arr[i]` / `record[key]` honestly `T | undefined`. Without it TypeScript silently
// types `const [row] = await db.insert(...).returning()` as non-nullable, so `row.id` type-checks
// and throws at runtime on an empty result. Assert it (and the rest of the floor) so a future edit
// cannot quietly weaken the bar.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const readConfig = (name) =>
  JSON.parse(readFileSync(path.join(here, '..', 'tsconfig', name), 'utf8'));

const PRESETS = ['react.json', 'react-native.json', 'next.json', 'nest.json'];

/**
 * The type-SAFETY floor: what makes the compiler catch bugs. No preset may weaken these — doing so
 * is a breaking change to consumers.
 */
const SAFETY_FLOOR = {
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  forceConsistentCasingInFileNames: true,
};

/**
 * Module MECHANICS: the base sets these, but a framework may legitimately override them (NestJS
 * turns `isolatedModules`/`verbatimModuleSyntax` off because `emitDecoratorMetadata` needs the
 * full-program, CommonJS decorator emit). They are not a safety bar, so they are asserted on the
 * base only — never on the presets.
 */
const BASE_MECHANICS = {
  isolatedModules: true,
  verbatimModuleSyntax: true,
};

test('base: sets the full type-safety floor', () => {
  const { compilerOptions } = readConfig('base.json');
  for (const [flag, expected] of Object.entries(SAFETY_FLOOR)) {
    assert.equal(
      compilerOptions[flag],
      expected,
      `tsconfig/base.json must set ${flag}: ${expected}`
    );
  }
});

test('base: sets the module mechanics defaults', () => {
  const { compilerOptions } = readConfig('base.json');
  for (const [flag, expected] of Object.entries(BASE_MECHANICS)) {
    assert.equal(
      compilerOptions[flag],
      expected,
      `tsconfig/base.json must set ${flag}: ${expected}`
    );
  }
});

// The framework presets inherit the floor rather than restating it, so `extends` IS the contract:
// if one stops extending base, it silently loses noUncheckedIndexedAccess and the rest.
for (const preset of PRESETS) {
  test(`${preset}: extends base`, () => {
    assert.equal(readConfig(preset).extends, './base.json', `${preset} must extend ./base.json`);
  });

  test(`${preset}: does not weaken the type-safety floor`, () => {
    const { compilerOptions = {} } = readConfig(preset);
    for (const [flag, expected] of Object.entries(SAFETY_FLOOR)) {
      if (flag in compilerOptions) {
        assert.equal(
          compilerOptions[flag],
          expected,
          `${preset} must not weaken ${flag} inherited from base`
        );
      }
    }
  });
}
