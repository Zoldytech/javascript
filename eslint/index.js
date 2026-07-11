// @zoldytech/javascript — general-purpose, SonarQube-compatible house style.
// Each preset is a function returning antfu's FlatConfigComposer; use it as the
// default export of your eslint.config.mjs (no spread needed).
//
//   import { next } from '@zoldytech/javascript/eslint';
//   export default next({ typeChecked: true });

export { base } from './base.js';
export { nest } from './nest.js';
export { next } from './next.js';
export { react } from './react.js';
