If you are using `yarn` or `npm`, you can add the `@sentry/node` package as a dependency:

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

const express = require("express");
const app = express();

// All controllers should live here
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

// The error handler must be after all routes
Sentry.setupExpressErrorHandler(app);

app.listen(3000);
```

- **tracesSampleRate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production to save costs and disk space.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

You can verify the GlitchTip integration by creating a route that will throw an error:

```js
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first GlitchTip error!");
});
```

## Customizing Error Handling

`setupExpressErrorHandler` accepts an options object. By default it captures errors with a status code of `500` or higher. To customize which errors are captured, provide a `shouldHandleError` callback:

```js
Sentry.setupExpressErrorHandler(app, {
  shouldHandleError(error) {
    // Capture all 404 and 500 errors
    if (error.status === 404 || error.status === 500) {
      return true;
    }
    return false;
  },
});
```
