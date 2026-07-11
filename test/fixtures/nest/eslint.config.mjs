import { nest } from '../../../eslint/nest.js';

// Absolute tsconfig path: the test harness runs `node --test` from the package
// root, so a relative path would resolve there. Real consumers run ESLint from
// their project root, where the default `tsconfig.json` resolves correctly.
export default nest({ typeChecked: true, tsconfigPath: `${import.meta.dirname}/tsconfig.json` });
