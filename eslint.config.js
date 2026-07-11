// Self-lint (dogfood): the package's own source is linted with its own `base`
// preset. Fixture apps have their own configs and are excluded here.

import { base } from './eslint/base.js';

export default base({
  ignores: ['node_modules/', 'test/fixtures/**'],
  overrides: [
    {
      // This repo's tests deliberately use the Node built-in test runner.
      name: 'zoldytech/repo-tests',
      files: ['test/**/*.js'],
      rules: { 'test/no-import-node-test': 'off' },
    },
  ],
});
