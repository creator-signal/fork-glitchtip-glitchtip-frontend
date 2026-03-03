GlitchTip is compatible with the Sentry JavaScript SDK.

## Step 1: Install the SDK via CDN or NPM

### Option 1: NPM

```bash
npm install @sentry/browser
```

### Option 2: CDN

Add the following script tag to your HTML file. Check the [Sentry JavaScript releases](https://github.com/getsentry/sentry-javascript/releases) for the latest version number.

```html
<script src="https://browser.sentry-cdn.com/8.x/bundle.min.js" crossorigin="anonymous"></script>
```

## Step 2: Initialize the SDK

Initialize the Sentry SDK as early as possible during your page load:

```javascript
Sentry.init({
  dsn: "YOUR_DSN",
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});
```

- **tracesSampleRate** - Percent of page loads captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

## Step 3: Verify Error Reporting

Create a simple test by calling an undefined function:

```javascript
myUndefinedFunction();
```
