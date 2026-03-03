To use GlitchTip with your React application, you will need to use the `@sentry/react` SDK.

### Installation

```bash
# Using yarn
$ yarn add @sentry/react

# Using npm
$ npm install @sentry/react
```

### Connecting the SDK to GlitchTip

Initialize the SDK as early as possible in your application, before rendering React. In your entry file (e.g., `main.jsx` or `index.jsx`):

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- **tracesSampleRate** - Percent of page loads captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production. Use `1.0` during development.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

On its own, `@sentry/react` will report any uncaught exceptions triggered from your application.

### Verify

Trigger a test error by rendering a button that calls an undefined function:

```jsx
return <button onClick={methodDoesNotExist}>Break the world</button>;
```
