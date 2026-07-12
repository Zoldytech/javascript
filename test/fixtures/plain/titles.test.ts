// Uppercase-opening titles: acronyms and proper nouns that `test/prefer-lowercase-title`
// would otherwise mangle (POST -> pOST, RLS -> rLS). The preset disables that rule for test
// files, so these must NOT trip it.
import { describe, expect, it } from 'vitest';

describe('POST /api/webhooks handler', () => {
  it('RLS confines the query to the calling tenant', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('Clerk session maps to the app user', () => {
    expect('a'.toUpperCase()).toBe('A');
  });
});
