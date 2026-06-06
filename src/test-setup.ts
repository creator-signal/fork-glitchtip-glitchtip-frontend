// Initialises the `$localize` global so component specs that reference
// $localize`...` (via i18n) compile and run under the vitest test runner.
// The build/serve targets get this through the @angular/localize/init
// polyfill; the unit-test builder needs it wired in explicitly here.
import "@angular/localize/init";
