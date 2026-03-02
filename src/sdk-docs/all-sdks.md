To start using GlitchTip, you need to:

1. Install a library into your project so it is able to send events to GlitchTip.
2. Configure it with a Data Source Name (DSN) so it knows where exactly to send events. Your DSN is below, and can also be found in the project's settings.
3. Initialize the library with your DSN to start sending events.

## General Configuration

GlitchTip is compatible with Sentry SDKs. Most support:

- **dsn** — Where to send event data, found in GlitchTip project settings.
- **release** — Set release name such as "1.0".
- **environment** — Set the running environment name, such as "production".

## Source Maps & Debug Symbols

For JavaScript projects, upload source maps to get readable stack traces. For native applications, upload debug symbols (dSYM, PDB, ELF).

Use the [GlitchTip CLI](/documentation/cli) to upload source maps and debug symbols:

```bash
glitchtip-cli sourcemaps upload ./dist
glitchtip-cli debug-files upload ./build
```
