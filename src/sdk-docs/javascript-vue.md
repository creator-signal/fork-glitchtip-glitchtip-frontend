To use GlitchTip with your Vue application, you will need to use the `@sentry/vue` SDK.

```bash
# Using yarn
$ yarn add @sentry/vue

# Using npm
$ npm install @sentry/vue --save
```

On its own, `@sentry/vue` will report any uncaught exceptions triggered by your application.

Additionally, the SDK will capture the name and props state of the active component where the error was thrown. This is reported via Vue's `config.errorHandler` hook.

Initialize the SDK in your `main.js` or `main.ts`:

```javascript
import { createApp } from "vue";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "YOUR_DSN",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});

app.mount("#app");
```

- **tracesSampleRate** - Percent of page loads captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production. Use `1.0` during development.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

If you use Vue Router, pass it to the browser tracing integration for route-aware transaction names:

```javascript
import router from "./router";

Sentry.init({
  app,
  dsn: "YOUR_DSN",
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});
```

## Verify

Trigger a test error from a component:

```javascript
<button @click="throwError">Break the world</button>

// In your methods:
throwError() {
  throw new Error("GlitchTip test error!");
}
```

## Vue-Specific Configuration

The SDK accepts a few Vue-specific `Sentry.init` options:

- **attachProps** (defaults to `true`) - Includes all Vue components' props with the events.
- **logErrors** (defaults to `true`) - Whether the SDK should also call Vue's original `logError` function.
