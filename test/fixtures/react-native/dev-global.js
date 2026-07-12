// Guards the preset's RN globals block: in a .js file `no-undef` is active, so
// this errors unless `__DEV__` is declared as a global. (In .tsx, no-undef is
// off, so clean.tsx can't catch a regression here.)
export const isDev = __DEV__;
