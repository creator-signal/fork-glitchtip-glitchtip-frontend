GlitchTip recommends using [@micro-sentry/angular](https://github.com/taiga-family/micro-sentry). Alternatively, users who want performance data need to use `@sentry/angular`.

# @micro-sentry

@micro-sentry features a very small bundle size and is easy to configure.

Install `@micro-sentry/angular`:

```bash
$ npm install --save @micro-sentry/angular
```

In `app.module.ts` add MicroSentryModule with your GlitchTip DSN.

```javascript
import { MicroSentryModule } from '@micro-sentry/angular';

@NgModule({
  imports: [
    MicroSentryModule.forRoot({
      dsn: "YOUR_DSN",
    }),
  ],
})
```

## Configuration

- **dsn** - Where to send event data to. Found in GlitchTip under project settings.
- **environment** - Set the running environment name, such as "production". When running in Node (Angular Universal), this defaults to environment variable `SENTRY_ENVIRONMENT`.
- **release** - Set release name such as "1.0". Required to make use of uploaded sourcemaps.

```javascript
    MicroSentryModule.forRoot({
      dsn: "YOUR_DSN",
      environment: "production",
      release: "1.0.0"
    }),
```

# @sentry/angular

@sentry/angular has more features including performance tracking.

Install `@sentry/angular`:

```bash
$ npm install --save @sentry/angular
```

For best results, add this snippet to your `main.ts`:

```javascript
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.01,
  autoSessionTracking: false,
});
```

## Configuration

- **dsn** - Where to send event data to. Found in GlitchTip under project settings.
- **release** - Set release name such as "1.0". Defaults to environment variable `SENTRY_RELEASE`.
- **environment** - Set the running environment name, such as "production". Defaults to environment variable `SENTRY_ENVIRONMENT`.
- **tracesSampleRate** - Percent of page loads captured for [performance monitoring](/documentation/performance). `0.01` means 1%. We recommend a low value in production.
- **autoSessionTracking** - Not supported by GlitchTip. Set to `false`.

### Show user feedback dialog

Provide a custom Angular ErrorHandler. Adjust your providers:

```javascript
providers: [
  {
    provide: ErrorHandler,
    useValue: Sentry.createErrorHandler({
      showDialog: true,
    }),
  },
],
```
