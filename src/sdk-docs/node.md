Use `yarn` or `npm` to add `@sentry/node` to your project:

```bash
# Using yarn
$ yarn add @sentry/node

# Using npm
$ npm install @sentry/node
```

**Important:** Initialize the SDK before importing any other modules, so that it can automatically instrument them.

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "YOUR_DSN",
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});
```

- **tracesSampleRate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

One way to verify your setup is to call an undefined function:

```js
myUndefinedFunction();
```
