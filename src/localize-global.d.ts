// Makes the `$localize` global type available to the unit-test TypeScript
// program. The build/serve targets pull this in via the
// `@angular/localize/init` polyfill; the unit-test builder compiles against
// `tsconfig.spec.json`, which doesn't, so we surface the global declaration
// here (matched by the `src/**/*.d.ts` include).
import "@angular/localize/init";
