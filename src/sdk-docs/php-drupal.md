## Installation

Add the Sentry SDK to your Drupal project:

```bash
composer require "sentry/sdk:^4.0"
```

For Drupal sites using the [Raven module](https://www.drupal.org/project/raven), install it with:

```bash
composer require drupal/raven
```

## Configuration

### Using the Raven Module

Configure your GlitchTip DSN and which events to capture in the "Sentry" section of the logging and errors configuration page at `admin/config/development/logging`.

You can override settings with environment variables:

- `SENTRY_DSN` — your GlitchTip DSN
- `SENTRY_ENVIRONMENT` — deployment environment name
- `SENTRY_RELEASE` — release version identifier

### Manual Setup

If not using the Raven module, initialize the Sentry SDK in your `settings.php`:

```php
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
    \Sentry\init([
        'dsn' => 'YOUR_DSN',
    ]);
}
```

## Verify

Using the Raven module, verify from the command line:

```bash
drush raven:captureMessage 'Mic check'
```

The message should appear in GlitchTip within a few seconds.

## Support

See the [Raven module project page](https://www.drupal.org/project/raven) for additional documentation and support.
