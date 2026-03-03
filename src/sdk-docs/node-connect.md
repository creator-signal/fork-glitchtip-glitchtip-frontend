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

const connect = require("connect");
const http = require("http");
const app = connect();

app.use(function (req, res) {
  res.end("Hello world!");
});

http.createServer(app).listen(3000);
```

- **tracesSampleRate** - Percent of requests captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

Verify the integration by throwing an error:

```js
app.use(function (req, res) {
  throw new Error("My first GlitchTip error!");
});
```
