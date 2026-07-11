// @zoldytech/eslint-config — SonarQube-equivalent ESLint flat-config guardrails.
// Each preset is a function returning a flat-config array; call it in your
// eslint.config.mjs and spread the result.
//
//   import { next } from '@zoldytech/eslint-config/eslint';
//   export default next({ typeChecked: true });

export { base } from './base.js';
export { react } from './react.js';
export { next } from './next.js';
export { nest } from './nest.js';
