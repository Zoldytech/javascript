import { nest } from '../../../eslint/nest.js';
export default nest({
  typeChecked: true,
  tsconfigPath: './tsconfig.json',
  tsconfigRootDir: import.meta.dirname,
});
